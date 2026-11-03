import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { DarajaConfigurationDto, StartDarajaPaymentDto } from "./auth.dto";
import { decryptDarajaSecret, encryptDarajaSecret } from "./daraja-crypto";
import { PrismaService } from "./prisma.service";
import { getApiPublicUrl } from "./config";

type DarajaCredentials = {
  groupId: string;
  shortcode: string;
  shortcodeType: "PAYBILL" | "TILL";
  consumerKeyEncrypted: string;
  consumerSecretEncrypted: string;
  passkeyEncrypted: string;
};

type CallbackDetails = {
  checkoutRequestId: string;
  merchantRequestId: string | null;
  resultCode: number;
  amountMinor: bigint | null;
  phone: string | null;
  receipt: string | null;
};

function objectValue(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function stringValue(value: unknown, maximumLength = 128) {
  return typeof value === "string" && value.length > 0 && value.length <= maximumLength ? value : null;
}

export function darajaCallbackBaseUrl(
  configured = process.env.DARAJA_CALLBACK_URL
    ?? `${getApiPublicUrl()}/api/payments/daraja/callback`,
) {
  const message = "Set DARAJA_CALLBACK_URL to a publicly reachable HTTPS URL ending in /api/payments/daraja/callback.";
  if (!configured) throw new ServiceUnavailableException(message);
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new ServiceUnavailableException(message);
  }
  const hostname = url.hostname.toLowerCase();
  const callbackPath = url.pathname.replace(/\/+$/, "");
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    !callbackPath.endsWith("/api/payments/daraja/callback")
  ) {
    throw new ServiceUnavailableException(message);
  }
  return url.toString().replace(/\/+$/, "");
}

export function normalizeDarajaPhone(phone: string) {
  const compact = phone.replace(/[\s()-]/g, "");
  const national = compact.startsWith("+254")
    ? compact.slice(1)
    : compact.startsWith("0")
      ? `254${compact.slice(1)}`
      : compact.startsWith("254")
        ? compact
        : `254${compact}`;
  if (!/^254[17]\d{8}$/.test(national)) throw new BadRequestException("Enter a valid Kenyan mobile number.");
  return national;
}

export function parseDarajaCallback(payload: unknown): CallbackDetails {
  const root = objectValue(payload);
  const body = objectValue(root?.Body);
  const callback = objectValue(body?.stkCallback);
  const checkoutRequestId = stringValue(callback?.CheckoutRequestID);
  const resultCode = callback?.ResultCode;
  if (!checkoutRequestId || typeof resultCode !== "number" || !Number.isInteger(resultCode)) {
    throw new BadRequestException("The M-Pesa callback payload is invalid.");
  }
  const metadata = objectValue(callback?.CallbackMetadata);
  const items = Array.isArray(metadata?.Item) ? metadata.Item : [];
  const values = new Map<string, unknown>();
  for (const item of items) {
    const entry = objectValue(item);
    if (typeof entry?.Name === "string") values.set(entry.Name, entry.Value);
  }
  const amount = values.get("Amount");
  const amountMinor = typeof amount === "number" && Number.isSafeInteger(amount) && amount > 0
    ? BigInt(amount) * 100n
    : null;
  const rawPhone = values.get("PhoneNumber");
  const phone = typeof rawPhone === "number" && Number.isSafeInteger(rawPhone)
    ? String(rawPhone)
    : typeof rawPhone === "string"
      ? rawPhone
      : null;
  return {
    checkoutRequestId,
    merchantRequestId: stringValue(callback?.MerchantRequestID),
    resultCode,
    amountMinor,
    phone: phone ? normalizeDarajaPhone(phone) : null,
    receipt: stringValue(values.get("MpesaReceiptNumber"), 32),
  };
}

@Injectable()
export class DarajaService {
  private readonly accessTokens = new Map<string, { token: string; expiresAt: number }>();
  private readonly lastStatusChecks = new Map<string, number>();

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async configuration(groupId: string) {
    const config = await this.prisma.darajaConfiguration.findUnique({
      where: { groupId },
      select: { shortcode: true, shortcodeType: true },
    });
    return {
      configured: Boolean(config),
      shortcode: config?.shortcode ?? null,
      shortcodeType: config?.shortcodeType ?? "PAYBILL",
      environment: "sandbox",
    };
  }

  async saveConfiguration(groupId: string, actorId: string, input: DarajaConfigurationDto) {
    const existing = await this.prisma.darajaConfiguration.findUnique({ where: { groupId } });
    const consumerKey = input.consumerKey?.trim();
    const consumerSecret = input.consumerSecret?.trim();
    const passkey = input.passkey?.trim();
    if (!existing && (!consumerKey || !consumerSecret || !passkey)) {
      throw new BadRequestException("Enter the consumer key, consumer secret, and passkey to configure M-Pesa.");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const config = await tx.darajaConfiguration.upsert({
        where: { groupId },
        create: {
          groupId,
          shortcode: input.shortcode,
          shortcodeType: input.shortcodeType,
          consumerKeyEncrypted: encryptDarajaSecret(consumerKey!),
          consumerSecretEncrypted: encryptDarajaSecret(consumerSecret!),
          passkeyEncrypted: encryptDarajaSecret(passkey!),
        },
        update: {
          shortcode: input.shortcode,
          shortcodeType: input.shortcodeType,
          ...(consumerKey ? { consumerKeyEncrypted: encryptDarajaSecret(consumerKey) } : {}),
          ...(consumerSecret ? { consumerSecretEncrypted: encryptDarajaSecret(consumerSecret) } : {}),
          ...(passkey ? { passkeyEncrypted: encryptDarajaSecret(passkey) } : {}),
        },
        select: { shortcode: true, shortcodeType: true },
      });
      await tx.auditEvent.create({
        data: {
          groupId,
          actorId,
          action: "MPESA_CONFIGURATION_UPDATED",
          entityType: "DarajaConfiguration",
          entityId: groupId,
        },
      });
      return config;
    });
    this.accessTokens.delete(groupId);
    return {
      configured: true,
      shortcode: updated.shortcode,
      shortcodeType: updated.shortcodeType,
      environment: "sandbox",
    };
  }

  async startPayment(userId: string, groupId: string, memberId: string, input: StartDarajaPaymentDto) {
    const amountKes = BigInt(input.amountKes);
    if (amountKes > 150_000n) throw new BadRequestException("Sandbox M-Pesa payments are limited to KES 150,000.");
    const config = await this.getCredentials(groupId);
    const callbackBaseUrl = darajaCallbackBaseUrl();
    const savingsGoal = input.savingsGoalId
      ? await this.prisma.savingsGoal.findFirst({ where: { id: input.savingsGoalId, groupId } })
      : null;
    if (input.savingsGoalId && !savingsGoal) throw new BadRequestException("Choose a savings goal in your group.");
    if (savingsGoal?.memberId && savingsGoal.memberId !== memberId) {
      throw new BadRequestException("This savings goal belongs to a different member.");
    }
    if (savingsGoal) {
      const end = new Date(savingsGoal.deadline);
      end.setUTCDate(end.getUTCDate() + 1);
      const now = new Date();
      if (now < savingsGoal.startsAt || now >= end) {
        throw new BadRequestException("Choose a savings goal that is within its date range.");
      }
    }
    const phone = normalizeDarajaPhone(input.phone);
    const id = randomUUID();
    const payment = await this.prisma.$transaction(async (tx) => {
      const attempt = await tx.darajaPayment.create({
        data: {
          id,
          groupId,
          memberId,
          initiatedById: userId,
          savingsGoalId: savingsGoal?.id ?? null,
          amountMinor: amountKes * 100n,
          phone,
          callbackToken: randomUUID(),
        },
      });
      await tx.auditEvent.create({
        data: {
          groupId,
          actorId: userId,
          action: "MPESA_PAYMENT_INITIATED",
          entityType: "DarajaPayment",
          entityId: attempt.id,
        },
      });
      return attempt;
    });

    let accessToken: string;
    try {
      accessToken = await this.accessToken(groupId, config);
    } catch {
      await this.markFailed(payment.id, "Safaricom authentication failed.");
      throw new ServiceUnavailableException("Safaricom authentication failed. Check the sandbox credentials in Settings.");
    }

    const timestamp = this.timestamp();
    const password = this.password(config, timestamp);
    let response: Record<string, unknown>;
    try {
      response = await this.requestJson("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          BusinessShortCode: config.shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: config.shortcodeType === "TILL" ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline",
          Amount: Number(amountKes),
          PartyA: phone,
          PartyB: config.shortcode,
          PhoneNumber: phone,
          CallBackURL: `${callbackBaseUrl}/${payment.callbackToken}`,
          AccountReference: `MW${payment.id.replaceAll("-", "").slice(0, 10)}`,
          TransactionDesc: "Wealth Sketch savings",
        }),
      });
    } catch {
      return this.paymentStatus(payment.id, "The request status is unknown. Check the payment phone before trying again.");
    }

    const checkoutRequestId = stringValue(response.CheckoutRequestID);
    const merchantRequestId = stringValue(response.MerchantRequestID);
    if (response.ResponseCode !== "0" || !checkoutRequestId) {
      await this.markFailed(payment.id, "Safaricom did not accept the payment request.");
      throw new BadGatewayException("Safaricom did not accept the M-Pesa payment request.");
    }
    await this.prisma.darajaPayment.update({
      where: { id: payment.id },
      data: { checkoutRequestId, merchantRequestId },
    });
    return this.paymentStatus(payment.id, "Check your phone and enter your M-Pesa PIN to approve the payment.");
  }

  async receiveCallback(callbackToken: string, payload: unknown) {
    const callback = parseDarajaCallback(payload);
    const payment = await this.prisma.darajaPayment.findUnique({ where: { callbackToken } });
    if (!payment) throw new NotFoundException("Payment request not found.");
    if (
      (payment.checkoutRequestId && payment.checkoutRequestId !== callback.checkoutRequestId) ||
      (payment.merchantRequestId && callback.merchantRequestId && payment.merchantRequestId !== callback.merchantRequestId)
    ) {
      throw new BadRequestException("The callback does not match this payment request.");
    }
    if (payment.status !== "PENDING") return;
    await this.prisma.darajaPayment.updateMany({
      where: { id: payment.id, status: "PENDING", callbackResultCode: null },
      data: {
        checkoutRequestId: callback.checkoutRequestId,
        merchantRequestId: callback.merchantRequestId,
        callbackResultCode: callback.resultCode,
        callbackAmountMinor: callback.amountMinor,
        callbackPhone: callback.phone,
        callbackReceipt: callback.receipt,
      },
    });
  }

  async statusForGroup(paymentId: string, groupId: string, memberId: string, canViewGroupPayments: boolean) {
    const payment = await this.prisma.darajaPayment.findFirst({ where: { id: paymentId, groupId } });
    if (!payment) throw new NotFoundException("M-Pesa payment request not found.");
    if (!canViewGroupPayments && payment.memberId !== memberId) {
      throw new NotFoundException("M-Pesa payment request not found.");
    }
    if (payment.status !== "PENDING" || !payment.checkoutRequestId || payment.callbackResultCode === null) {
      return this.toStatus(payment);
    }
    const lastCheck = this.lastStatusChecks.get(payment.id) ?? 0;
    if (Date.now() - lastCheck < 5_000) return this.toStatus(payment);
    this.lastStatusChecks.set(payment.id, Date.now());

    const config = await this.getCredentials(groupId);
    const verification = await this.queryPayment(config, payment.checkoutRequestId);
    const verifiedCode = Number(verification.ResultCode);
    if (!Number.isInteger(verifiedCode)) {
      throw new ServiceUnavailableException("Safaricom has not returned a verifiable payment status yet.");
    }

    if (
      verifiedCode === 0 &&
      payment.callbackResultCode === 0 &&
      payment.callbackAmountMinor === payment.amountMinor &&
      payment.callbackPhone === payment.phone &&
      payment.callbackReceipt
    ) {
      await this.finalizeSuccess(payment.id, payment.callbackReceipt);
    } else if (verifiedCode !== 0 && verifiedCode === payment.callbackResultCode) {
      await this.markFailed(payment.id, "The M-Pesa payment was not completed.");
    }
    const refreshed = await this.prisma.darajaPayment.findFirstOrThrow({ where: { id: payment.id, groupId } });
    return this.toStatus(refreshed);
  }

  private async finalizeSuccess(paymentId: string, receipt: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const payment = await tx.darajaPayment.findUniqueOrThrow({ where: { id: paymentId } });
        const claimed = await tx.darajaPayment.updateMany({
          where: { id: paymentId, status: "PENDING", callbackResultCode: 0 },
          data: { status: "SUCCEEDED", mpesaReceipt: receipt, resultDescription: "Payment confirmed by Safaricom.", completedAt: new Date() },
        });
        if (claimed.count !== 1) return;
        const reference = `MPESA-${receipt}`;
        const contribution = await tx.contribution.create({
          data: {
            groupId: payment.groupId,
            memberId: payment.memberId,
            savingsGoalId: payment.savingsGoalId,
            recordedById: payment.initiatedById,
            amountMinor: payment.amountMinor,
            method: "MPESA",
            reference,
            idempotencyKey: `daraja-${payment.id}`,
            note: "Confirmed through Safaricom Daraja STK Push.",
            darajaPaymentId: payment.id,
          },
        });
        const group = await tx.group.findUniqueOrThrow({ where: { id: payment.groupId }, select: { currency: true } });
        await tx.ledgerTransaction.create({
          data: {
            groupId: payment.groupId,
            reference,
            description: "M-Pesa contribution confirmed by Safaricom",
            currency: group.currency,
            amountMinor: payment.amountMinor,
            entries: {
              create: [
                { account: "GROUP_CASH", side: "DEBIT", amountMinor: payment.amountMinor },
                { account: "MEMBER_CONTRIBUTIONS", side: "CREDIT", amountMinor: payment.amountMinor },
              ],
            },
          },
        });
        await tx.auditEvent.create({
          data: {
            groupId: payment.groupId,
            actorId: payment.initiatedById,
            action: "MPESA_PAYMENT_CONFIRMED",
            entityType: "Contribution",
            entityId: contribution.id,
          },
        });
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        await this.markFailed(paymentId, "This M-Pesa receipt was already used.");
        throw new BadGatewayException("This M-Pesa receipt has already been used. Contact your group administrator.");
      }
      throw error;
    }
  }

  private async markFailed(paymentId: string, description: string) {
    await this.prisma.$transaction(async (tx) => {
      const payment = await tx.darajaPayment.findUniqueOrThrow({ where: { id: paymentId } });
      const changed = await tx.darajaPayment.updateMany({
        where: { id: paymentId, status: "PENDING" },
        data: { status: "FAILED", resultDescription: description, completedAt: new Date() },
      });
      if (changed.count === 1) {
        await tx.auditEvent.create({
          data: {
            groupId: payment.groupId,
            actorId: payment.initiatedById,
            action: "MPESA_PAYMENT_FAILED",
            entityType: "DarajaPayment",
            entityId: payment.id,
          },
        });
      }
    });
  }

  private async getCredentials(groupId: string): Promise<DarajaCredentials> {
    const config = await this.prisma.darajaConfiguration.findUnique({ where: { groupId } });
    if (!config) throw new BadRequestException("Ask your group administrator to configure M-Pesa in Settings.");
    return config;
  }

  private async accessToken(groupId: string, config: DarajaCredentials) {
    const cached = this.accessTokens.get(groupId);
    if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;
    const credentials = `${decryptDarajaSecret(config.consumerKeyEncrypted)}:${decryptDarajaSecret(config.consumerSecretEncrypted)}`;
    const response = await this.requestJson("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${Buffer.from(credentials).toString("base64")}` },
    });
    const token = stringValue(response.access_token);
    if (!token) throw new ServiceUnavailableException("Safaricom authentication failed.");
    const expiresIn = Number(response.expires_in);
    this.accessTokens.set(groupId, { token, expiresAt: Date.now() + (Number.isFinite(expiresIn) ? expiresIn : 3600) * 1000 });
    return token;
  }

  private async queryPayment(config: DarajaCredentials, checkoutRequestId: string) {
    const accessToken = await this.accessToken(config.groupId, config);
    const timestamp = this.timestamp();
    return this.requestJson("https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        BusinessShortCode: config.shortcode,
        Password: this.password(config, timestamp),
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }),
    });
  }

  private password(config: DarajaCredentials, timestamp: string) {
    return Buffer.from(
      `${config.shortcode}${decryptDarajaSecret(config.passkeyEncrypted)}${timestamp}`,
    ).toString("base64");
  }

  private timestamp() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Nairobi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
    return `${value("year")}${value("month")}${value("day")}${value("hour")}${value("minute")}${value("second")}`;
  }

  private async requestJson(url: string, init: RequestInit) {
    let response: Response;
    try {
      response = await fetch(url, { ...init, signal: AbortSignal.timeout(15_000), headers: { "Content-Type": "application/json", ...init.headers } });
    } catch {
      throw new ServiceUnavailableException("Unable to reach Safaricom Daraja.");
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new ServiceUnavailableException("Safaricom returned an invalid response.");
    }
    const result = objectValue(payload);
    if (!response.ok || !result) throw new ServiceUnavailableException("Safaricom could not process the request.");
    return result;
  }

  private async paymentStatus(paymentId: string, message: string) {
    const payment = await this.prisma.darajaPayment.findUniqueOrThrow({ where: { id: paymentId } });
    return { ...this.toStatus(payment), message };
  }

  private toStatus(payment: {
    id: string;
    status: "PENDING" | "SUCCEEDED" | "FAILED";
    amountMinor: bigint;
    mpesaReceipt: string | null;
    resultDescription: string | null;
  }) {
    return {
      id: payment.id,
      status: payment.status,
      amountMinor: payment.amountMinor.toString(),
      receipt: payment.mpesaReceipt,
      message: payment.resultDescription,
    };
  }
}

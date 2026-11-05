       import { randomBytes } from "node:crypto";
       import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendMemberInvitation(input: {
    email: string;
    name: string;
    groupName: string;
    invitationUrl: string;
  }) {
    await this.sendEmail({
      to: input.email,
      subject: `Join ${input.groupName} on Wealth Sketch`,
      text: `Hello ${input.name},\n\nYou have been invited to join ${input.groupName} on Wealth Sketch. Accept your invitation within 7 days:\n\n${input.invitationUrl}\n\nIf you were not expecting this invitation, you can ignore this email.`,
      html: `<p>Hello ${escapeHtml(input.name)},</p><p>You have been invited to join <strong>${escapeHtml(input.groupName)}</strong> on Wealth Sketch.</p><p><a href="${escapeHtml(input.invitationUrl)}">Accept your invitation</a>. This link expires in 7 days.</p><p>If you were not expecting this invitation, you can ignore this email.</p>`,
    }, "Invitation email could not be delivered.");
  }

  async sendPasswordReset(input: { email: string; name: string; resetUrl: string }) {
    await this.sendEmail({
      to: input.email,
      subject: "Reset your Wealth Sketch password",
      text: `Hello ${input.name},\n\nUse this secure link to reset your Wealth Sketch password. The link expires in one hour and can only be used once:\n\n${input.resetUrl}\n\nIf you did not request a password reset, you can ignore this email.`,
      html: `<p>Hello ${escapeHtml(input.name)},</p><p>Use this secure link to reset your Wealth Sketch password. The link expires in one hour and can only be used once:</p><p><a href="${escapeHtml(input.resetUrl)}">Reset your password</a></p><p>If you did not request a password reset, you can ignore this email.</p>`,
    }, "Password reset email could not be delivered.");
  }

  async sendReminder(input: { email: string; name: string; title: string; message: string; dueAt: Date }) {
    const dueAt = input.dueAt.toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
    await this.sendEmail({
      to: input.email,
      subject: `Wealth Sketch reminder: ${input.title}`,
      text: `Hello ${input.name},\n\n${input.message}\n\nDue: ${dueAt}`,
      html: `<p>Hello ${escapeHtml(input.name)},</p><p>${escapeHtml(input.message)}</p><p>Due: ${escapeHtml(dueAt)}</p>`,
    }, "Reminder email could not be delivered.");
  }

  private async sendEmail(message: EmailMessage, failureMessage: string) {
    const clientId = process.env.GMAIL_CLIENT_ID?.trim();
    const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim();
    const from = process.env.GMAIL_FROM?.trim();
    if (!clientId || !clientSecret || !refreshToken || !from || /[\r\n]/.test(from)) {
      throw new ServiceUnavailableException(
        "Email delivery is not configured. Set the Gmail API credentials and sender address.",
      );
    }

    const accessToken = await this.getAccessToken(clientId, clientSecret, refreshToken, failureMessage);
    const boundary = `wealthsketch-${randomBytes(16).toString("hex")}`;
    const mimeMessage = [
      `From: ${from}`,
      `To: ${message.to}`,
      `Subject: ${encodeMimeHeader(message.subject)}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      wrapBase64(Buffer.from(message.text, "utf8").toString("base64")),
      `--${boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      wrapBase64(Buffer.from(message.html, "utf8").toString("base64")),
      `--${boundary}--`,
      "",
    ].join("\r\n");
    const raw = Buffer.from(mimeMessage, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    try {
      const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
      });
      if (!response.ok) {
        this.logger.error(`Gmail API email request failed with HTTP ${response.status}.`);
        throw new ServiceUnavailableException(failureMessage);
      }
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      this.logger.error(
        "Gmail API email request failed.",
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException(failureMessage);
    }
  }

  private async getAccessToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string,
    failureMessage: string,
  ) {
    let response: Response;
    try {
      response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });
    } catch (error) {
      this.logger.error(
        "Google OAuth token refresh request failed.",
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException(failureMessage);
    }

    if (!response.ok) {
      this.logger.error(`Google OAuth token refresh failed with HTTP ${response.status}.`);
      throw new ServiceUnavailableException(failureMessage);
    }

    let tokenResponse: unknown;
    try {
      tokenResponse = await response.json();
    } catch (error) {
      this.logger.error(
        "Google OAuth token refresh returned an invalid response.",
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException(failureMessage);
    }

    if (
      typeof tokenResponse !== "object" ||
      tokenResponse === null ||
      !("access_token" in tokenResponse) ||
      typeof tokenResponse.access_token !== "string" ||
      !tokenResponse.access_token
    ) {
      this.logger.error("Google OAuth token refresh response did not contain an access token.");
      throw new ServiceUnavailableException(failureMessage);
    }
    return tokenResponse.access_token;
  }
}

function encodeMimeHeader(value: string) {
  if (/^[\x20-\x7e]*$/.test(value)) return value.replace(/[\r\n]/g, " ");
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function wrapBase64(value: string) {
  return value.match(/.{1,76}/g)?.join("\r\n") ?? "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

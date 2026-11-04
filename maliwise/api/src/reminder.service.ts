import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { MailService } from "./mail.service";

@Injectable()
export class ReminderService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReminderService.name);
  private interval: NodeJS.Timeout | undefined;
  private running = false;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MailService) private readonly mail: MailService,
  ) {}

  onModuleInit() {
    this.interval = setInterval(() => {
      void this.processDueReminders().catch((error: unknown) => {
        this.logger.error("Scheduled reminder processing failed.", error instanceof Error ? error.stack : undefined);
      });
    }, 30_000);
    this.interval.unref();
    void this.processDueReminders().catch((error: unknown) => {
      this.logger.error("Initial reminder processing failed.", error instanceof Error ? error.stack : undefined);
    });
  }

  onModuleDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  private async processDueReminders() {
    if (this.running) return;
    this.running = true;
    try {
      const dueReminders = await this.prisma.reminder.findMany({
        where: { processedAt: null, dueAt: { lte: new Date() } },
        orderBy: { dueAt: "asc" },
        take: 50,
      });
      for (const reminder of dueReminders) {
        await this.enqueueNotifications(reminder.id);
      }
      await this.deliverPendingNotifications();
    } finally {
      this.running = false;
    }
  }

  private async enqueueNotifications(reminderId: string) {
    await this.prisma.$transaction(async (tx) => {
      const reminder = await tx.reminder.findUnique({ where: { id: reminderId } });
      if (!reminder || reminder.processedAt || reminder.dueAt > new Date()) return;
      const claimed = await tx.reminder.updateMany({
        where: { id: reminder.id, processedAt: null },
        data: { processedAt: new Date() },
      });
      if (claimed.count !== 1) return;

      const groupMemberships = reminder.groupId
        ? await tx.groupMember.findMany({
          where: { groupId: reminder.groupId, userId: { not: null }, revokedAt: null, status: "APPROVED" },
          select: { userId: true },
        })
        : [];
      const recipientIds = new Set(groupMemberships.flatMap((membership) => membership.userId ? [membership.userId] : []));
      recipientIds.add(reminder.creatorId);
      await tx.userNotification.createMany({
        data: [...recipientIds].map((userId) => ({
          userId,
          reminderId: reminder.id,
          title: reminder.title,
          message: reminder.message,
          emailEnabled: reminder.emailEnabled,
          smsEnabled: reminder.smsEnabled,
        })),
      });
    });
  }

  private async deliverPendingNotifications() {
    const retryBefore = new Date(Date.now() - 5 * 60_000);
    const pending = await this.prisma.userNotification.findMany({
      where: {
        OR: [
          { emailEnabled: true, emailSentAt: null },
          { smsEnabled: true, smsSentAt: null },
        ],
        AND: [{ OR: [{ deliveryAttemptedAt: null }, { deliveryAttemptedAt: { lte: retryBefore } }] }],
      },
      orderBy: { createdAt: "asc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, memberships: { select: { groupId: true, phone: true } } } },
        reminder: { select: { dueAt: true, groupId: true } },
      },
    });

    for (const notification of pending) {
      const attemptedAt = new Date();
      await this.prisma.userNotification.update({
        where: { id: notification.id },
        data: { deliveryAttemptedAt: attemptedAt },
      });
      const errors: string[] = [];
      if (notification.emailEnabled && !notification.emailSentAt) {
        try {
          await this.mail.sendReminder({
            email: notification.user.email,
            name: notification.user.name,
            title: notification.title,
            message: notification.message,
            dueAt: notification.reminder?.dueAt ?? new Date(),
          });
          await this.prisma.userNotification.update({ where: { id: notification.id }, data: { emailSentAt: new Date() } });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Reminder email delivery failed.";
          errors.push(message);
          this.logger.error(`Reminder email delivery failed for notification ${notification.id}.`, message);
        }
      }
      if (notification.smsEnabled && !notification.smsSentAt) {
        try {
          const phone = notification.user.phone
            ?? notification.user.memberships.find((membership) => membership.groupId === notification.reminder?.groupId)?.phone
            ?? notification.user.memberships[0]?.phone;
          if (!phone) throw new ServiceUnavailableException("A phone number is required to send SMS reminders.");
          await this.sendSms(phone, `${notification.title}: ${notification.message}`);
          await this.prisma.userNotification.update({ where: { id: notification.id }, data: { smsSentAt: new Date() } });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Reminder SMS delivery failed.";
          errors.push(message);
          this.logger.error(`Reminder SMS delivery failed for notification ${notification.id}.`, message);
        }
      }
      await this.prisma.userNotification.update({
        where: { id: notification.id },
        data: { deliveryError: errors.length ? errors.join(" ").slice(0, 500) : null },
      });
    }
  }

  private async sendSms(phone: string, message: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    if (!accountSid || !authToken || !from) {
      throw new ServiceUnavailableException("SMS delivery is not configured. Set the Twilio account SID, auth token, and sender number.");
    }
    let response: Response;
    try {
      response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: phone, From: from, Body: message }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      throw new ServiceUnavailableException("Unable to reach the SMS provider.");
    }
    if (!response.ok) throw new ServiceUnavailableException("The SMS provider could not deliver this reminder.");
  }
}

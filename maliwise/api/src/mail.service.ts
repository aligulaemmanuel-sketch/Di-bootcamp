import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendMemberInvitation(input: {
    email: string;
    name: string;
    groupName: string;
    invitationUrl: string;
  }) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM;
    if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !password || !from) {
      throw new ServiceUnavailableException("Email delivery is not configured. Set the SMTP settings and try again.");
    }
    if (host.includes("gmail.com") && /google mail|replace-with-gmail-app-password|no-reply@example.com/i.test(password)) {
      throw new ServiceUnavailableException("Gmail requires a real App Password in SMTP_PASSWORD. Update the value in api/.env and try again.");
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    });
    try {
      await transporter.sendMail({
        from,
        to: input.email,
        subject: `Join ${input.groupName} on Wealth Sketch`,
        text: `Hello ${input.name},\n\nYou have been invited to join ${input.groupName} on Wealth Sketch. Accept your invitation within 7 days:\n\n${input.invitationUrl}\n\nIf you were not expecting this invitation, you can ignore this email.`,
        html: `<p>Hello ${escapeHtml(input.name)},</p><p>You have been invited to join <strong>${escapeHtml(input.groupName)}</strong> on Wealth Sketch.</p><p><a href="${escapeHtml(input.invitationUrl)}">Accept your invitation</a>. This link expires in 7 days.</p><p>If you were not expecting this invitation, you can ignore this email.</p>`,
      });
    } catch (error) {
      this.logger.error("Member invitation email delivery failed.", error instanceof Error ? error.stack : undefined);
      throw new ServiceUnavailableException("Invitation email could not be delivered. Check SMTP configuration and try again.");
    }
  }

  async sendPasswordReset(input: { email: string; name: string; resetUrl: string }) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM;
    if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !password || !from) {
      throw new ServiceUnavailableException("Email delivery is not configured.");
    }
    if (host.includes("gmail.com") && /google mail|replace-with-gmail-app-password|no-reply@example.com/i.test(password)) {
      throw new ServiceUnavailableException("Gmail requires a real App Password in SMTP_PASSWORD. Update the value in api/.env and try again.");
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    });
    try {
      await transporter.sendMail({
        from,
        to: input.email,
        subject: "Reset your Wealth Sketch password",
        text: `Hello ${input.name},\n\nUse this secure link to reset your Wealth Sketch password. The link expires in one hour and can only be used once:\n\n${input.resetUrl}\n\nIf you did not request a password reset, you can ignore this email.`,
        html: `<p>Hello ${escapeHtml(input.name)},</p><p>Use this secure link to reset your Wealth Sketch password. The link expires in one hour and can only be used once:</p><p><a href="${escapeHtml(input.resetUrl)}">Reset your password</a></p><p>If you did not request a password reset, you can ignore this email.</p>`,
      });
    } catch {
      throw new ServiceUnavailableException("Password reset email could not be delivered.");
    }
  }

  async sendEmailVerification(input: { email: string; name: string; verificationUrl: string }) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM;
    if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !password || !from) {
      throw new ServiceUnavailableException("Email delivery is not configured.");
    }
    if (host.includes("gmail.com") && /google mail|replace-with-gmail-app-password|no-reply@example.com/i.test(password)) {
      throw new ServiceUnavailableException("Gmail requires a real App Password in SMTP_PASSWORD. Update the value in api/.env and try again.");
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    });
    try {
      await transporter.sendMail({
        from,
        to: input.email,
        subject: "Verify your Wealth Sketch email",
        text: `Hello ${input.name},\n\nVerify your email address to activate your Wealth Sketch account:\n\n${input.verificationUrl}\n\nThis link expires in one hour. If you did not create this account, you can ignore this email.`,
        html: `<p>Hello ${escapeHtml(input.name)},</p><p>Verify your email address to activate your Wealth Sketch account:</p><p><a href="${escapeHtml(input.verificationUrl)}">Verify your email</a></p><p>This link expires in one hour. If you did not create this account, you can ignore this email.</p>`,
      });
    } catch (error) {
      this.logger.error("Email verification delivery failed.", error instanceof Error ? error.stack : undefined);
      throw new ServiceUnavailableException("The verification email could not be delivered. Check SMTP configuration and try again.");
    }
  }

  async sendReminder(input: { email: string; name: string; title: string; message: string; dueAt: Date }) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM;
    if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !password || !from) {
      throw new ServiceUnavailableException("Email delivery is not configured. Set the SMTP settings to send reminder emails.");
    }
    if (host.includes("gmail.com") && /google mail|replace-with-gmail-app-password|no-reply@example.com/i.test(password)) {
      throw new ServiceUnavailableException("Gmail requires a real App Password in SMTP_PASSWORD. Update the value in api/.env and try again.");
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    });
    try {
      await transporter.sendMail({
        from,
        to: input.email,
        subject: `Wealth Sketch reminder: ${input.title}`,
        text: `Hello ${input.name},\n\n${input.message}\n\nDue: ${input.dueAt.toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}`,
        html: `<p>Hello ${escapeHtml(input.name)},</p><p>${escapeHtml(input.message)}</p><p>Due: ${escapeHtml(input.dueAt.toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }))}</p>`,
      });
    } catch (error) {
      this.logger.error("Reminder email delivery failed.", error instanceof Error ? error.stack : undefined);
      throw new ServiceUnavailableException("Reminder email could not be delivered. Check SMTP configuration and try again.");
    }
  }
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

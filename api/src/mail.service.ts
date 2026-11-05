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

  async sendEmailVerification(input: { email: string; name: string; verificationUrl: string }) {
    await this.sendEmail({
      to: input.email,
      subject: "Verify your Wealth Sketch email",
      text: `Hello ${input.name},\n\nVerify your email address to activate your Wealth Sketch account:\n\n${input.verificationUrl}\n\nThis link expires in one hour. If you did not create this account, you can ignore this email.`,
      html: `<p>Hello ${escapeHtml(input.name)},</p><p>Verify your email address to activate your Wealth Sketch account:</p><p><a href="${escapeHtml(input.verificationUrl)}">Verify your email</a></p><p>This link expires in one hour. If you did not create this account, you can ignore this email.</p>`,
    }, "The verification email could not be delivered. Check the email provider configuration and try again.");
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
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.RESEND_FROM?.trim();
    if (!apiKey || !from) {
      throw new ServiceUnavailableException("Email delivery is not configured. Set RESEND_API_KEY and RESEND_FROM.");
    }

    let response: Response;
    try {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...message, from }),
      });
    } catch (error) {
      this.logger.error(
        "Resend email request failed.",
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException(failureMessage);
    }

    if (!response.ok) {
      this.logger.error(`Resend email request failed with HTTP ${response.status}.`);
      throw new ServiceUnavailableException(failureMessage);
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

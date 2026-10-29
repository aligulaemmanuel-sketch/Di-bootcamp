import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { ServiceUnavailableException } from "@nestjs/common";
import { MailService } from "./mail.service";

const smtpKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"] as const;
const originalValues = new Map(smtpKeys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of smtpKeys) {
    const original = originalValues.get(key);
    if (original === undefined) delete process.env[key];
    else process.env[key] = original;
  }
});

describe("MailService", () => {
  it("reports missing SMTP configuration instead of silently dropping invitations", async () => {
    for (const key of smtpKeys) delete process.env[key];
    const mail = new MailService();

    await assert.rejects(
      mail.sendMemberInvitation({
        email: "member@example.com",
        name: "Group member",
        groupName: "Savings group",
        invitationUrl: "http://localhost:3000/?invite=token",
      }),
      (error: unknown) =>
        error instanceof ServiceUnavailableException &&
        error.message.includes("Email delivery is not configured"),
    );
  });
});

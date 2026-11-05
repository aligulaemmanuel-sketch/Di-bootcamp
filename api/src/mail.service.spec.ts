import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { ServiceUnavailableException } from "@nestjs/common";
import { MailService } from "./mail.service";

const resendKeys = ["RESEND_API_KEY", "RESEND_FROM"] as const;
const originalValues = new Map(resendKeys.map((key) => [key, process.env[key]]));
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of resendKeys) {
    const original = originalValues.get(key);
    if (original === undefined) delete process.env[key];
    else process.env[key] = original;
  }
});

describe("MailService", () => {
  it("reports missing Resend configuration instead of silently dropping invitations", async () => {
    for (const key of resendKeys) delete process.env[key];
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
        error.message.includes("RESEND_API_KEY and RESEND_FROM"),
    );
  });

  it("sends verification email through the Resend API", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM = "Wealth Sketch <verify@example.com>";
    let requestBody: Record<string, unknown> | undefined;

    globalThis.fetch = async (input, init) => {
      assert.equal(input, "https://api.resend.com/emails");
      assert.equal(init?.method, "POST");
      assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer re_test_key");
      requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return new Response(JSON.stringify({ id: "email-id" }), { status: 200 });
    };

    const mail = new MailService();
    await mail.sendEmailVerification({
      email: "member@example.com",
      name: "<Member>",
      verificationUrl: "https://maliwise-web.onrender.com/?verifyEmail=token",
    });

    assert.equal(requestBody?.from, "Wealth Sketch <verify@example.com>");
    assert.equal(requestBody?.to, "member@example.com");
    assert.equal(requestBody?.subject, "Verify your Wealth Sketch email");
    assert.match(String(requestBody?.text), /https:\/\/maliwise-web\.onrender\.com/);
    assert.match(String(requestBody?.html), /&lt;Member&gt;/);
  });

  it("reports Resend API failures as an unavailable email service", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM = "Wealth Sketch <verify@example.com>";
    globalThis.fetch = async () => new Response("provider error", { status: 422 });

    const mail = new MailService();
    await assert.rejects(
      mail.sendEmailVerification({
        email: "member@example.com",
        name: "Member",
        verificationUrl: "https://maliwise-web.onrender.com/?verifyEmail=token",
      }),
      (error: unknown) =>
        error instanceof ServiceUnavailableException &&
        error.message.includes("verification email could not be delivered"),
    );
  });
});

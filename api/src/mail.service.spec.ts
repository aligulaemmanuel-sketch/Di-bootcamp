import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { ServiceUnavailableException } from "@nestjs/common";
import { MailService } from "./mail.service";

const gmailKeys = [
  "GMAIL_CLIENT_ID",
  "GMAIL_CLIENT_SECRET",
  "GMAIL_REFRESH_TOKEN",
  "GMAIL_FROM",
] as const;
const originalValues = new Map(gmailKeys.map((key) => [key, process.env[key]]));
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of gmailKeys) {
    const original = originalValues.get(key);
    if (original === undefined) delete process.env[key];
    else process.env[key] = original;
  }
});

describe("MailService", () => {
  it("reports missing Gmail API configuration instead of silently dropping invitations", async () => {
    for (const key of gmailKeys) delete process.env[key];
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
        error.message.includes("Gmail API credentials"),
    );
  });

  it("sends group invitation email through the Gmail API", async () => {
    process.env.GMAIL_CLIENT_ID = "client-id";
    process.env.GMAIL_CLIENT_SECRET = "client-secret";
    process.env.GMAIL_REFRESH_TOKEN = "refresh-token";
    process.env.GMAIL_FROM = "Wealth Sketch <sender@gmail.com>";
    const requests: { url: string; init?: RequestInit }[] = [];

    globalThis.fetch = async (input, init) => {
      const url = String(input);
      requests.push({ url, init });
      if (url === "https://oauth2.googleapis.com/token") {
        assert.equal(init?.method, "POST");
        assert.equal(new URLSearchParams(String(init?.body)).get("refresh_token"), "refresh-token");
        return new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 });
      }
      assert.equal(url, "https://gmail.googleapis.com/gmail/v1/users/me/messages/send");
      assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer access-token");
      return new Response(JSON.stringify({ id: "email-id" }), { status: 200 });
    };

    const mail = new MailService();
    await mail.sendMemberInvitation({
      email: "member@example.com",
      name: "<Member>",
      groupName: "Savings group",
      invitationUrl: "https://maliwise-web.onrender.com/?invite=token",
    });

    assert.equal(requests.length, 2);
    const sendBody = JSON.parse(String(requests[1].init?.body)) as { raw: string };
    const decodedMessage = Buffer.from(
      sendBody.raw.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    assert.match(decodedMessage, /From: Wealth Sketch <sender@gmail\.com>/);
    assert.match(decodedMessage, /To: member@example\.com/);
    assert.match(decodedMessage, /Subject: Join Savings group on Wealth Sketch/);
    const textPart = decodedMessage.split(
      "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n",
    )[1]?.split(`\r\n--`)[0];
    const htmlPart = decodedMessage.split(
      "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n",
    )[1]?.split(`\r\n--`)[0];
    assert.match(Buffer.from(textPart ?? "", "base64").toString("utf8"), /https:\/\/maliwise-web\.onrender\.com/);
    assert.match(Buffer.from(htmlPart ?? "", "base64").toString("utf8"), /&lt;Member&gt;/);
  });

  it("reports Gmail API failures as an unavailable email service", async () => {
    process.env.GMAIL_CLIENT_ID = "client-id";
    process.env.GMAIL_CLIENT_SECRET = "client-secret";
    process.env.GMAIL_REFRESH_TOKEN = "refresh-token";
    process.env.GMAIL_FROM = "Wealth Sketch <sender@gmail.com>";
    globalThis.fetch = async (input) =>
      String(input) === "https://oauth2.googleapis.com/token"
        ? new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 })
        : new Response("provider error", { status: 403 });

    const mail = new MailService();
    await assert.rejects(
      mail.sendMemberInvitation({
        email: "member@example.com",
        name: "Member",
        groupName: "Savings group",
        invitationUrl: "https://maliwise-web.onrender.com/?invite=token",
      }),
      (error: unknown) =>
        error instanceof ServiceUnavailableException &&
        error.message.includes("Invitation email could not be delivered"),
    );
  });

  it("fails explicitly when Google cannot refresh the Gmail API token", async () => {
    process.env.GMAIL_CLIENT_ID = "client-id";
    process.env.GMAIL_CLIENT_SECRET = "client-secret";
    process.env.GMAIL_REFRESH_TOKEN = "invalid-refresh-token";
    process.env.GMAIL_FROM = "sender@gmail.com";
    globalThis.fetch = async () => new Response("invalid grant", { status: 400 });

    const mail = new MailService();
    await assert.rejects(
      mail.sendMemberInvitation({
        email: "member@example.com",
        name: "Member",
        groupName: "Savings group",
        invitationUrl: "https://maliwise-web.onrender.com/?invite=token",
      }),
      (error: unknown) =>
        error instanceof ServiceUnavailableException &&
        error.message.includes("Invitation email could not be delivered"),
    );
  });
});

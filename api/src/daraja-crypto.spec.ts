import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ServiceUnavailableException } from "@nestjs/common";
import { decryptDarajaSecret, encryptDarajaSecret } from "./daraja-crypto";
import { darajaCallbackBaseUrl, normalizeDarajaPhone, parseDarajaCallback } from "./daraja.service";

const encryptionKey = Buffer.alloc(32, 7).toString("base64");

describe("Daraja credential encryption", () => {
  it("round-trips secrets with authenticated encryption", () => {
    const encrypted = encryptDarajaSecret("sandbox-secret", encryptionKey);

    assert.notEqual(encrypted, "sandbox-secret");
    assert.equal(decryptDarajaSecret(encrypted, encryptionKey), "sandbox-secret");
    assert.throws(() => decryptDarajaSecret(encrypted, Buffer.alloc(32, 8).toString("base64")));
  });
});

describe("Daraja payment input parsing", () => {
  it("normalizes Kenyan mobile numbers to the format expected by Daraja", () => {
    assert.equal(normalizeDarajaPhone("0712 345 678"), "254712345678");
    assert.equal(normalizeDarajaPhone("+254712345678"), "254712345678");
  });

  it("rejects malformed callback data", () => {
    assert.throws(() => parseDarajaCallback({ Body: {} }), /callback payload is invalid/);
  });

  it("extracts callback metadata without trusting it as payment confirmation", () => {
    const callback = parseDarajaCallback({
      Body: {
        stkCallback: {
          CheckoutRequestID: "ws_CO_123",
          MerchantRequestID: "123",
          ResultCode: 0,
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: 50 },
              { Name: "MpesaReceiptNumber", Value: "QAB123" },
              { Name: "PhoneNumber", Value: 254790197316},
            ],
          },
        },
      },
    });

    assert.equal(callback.checkoutRequestId, "ws_CO_123");
    assert.equal(callback.amountMinor, 5000n);
    assert.equal(callback.phone, "254790197316");
    assert.equal(callback.receipt, "QAB123");
  });
});

describe("Daraja callback configuration", () => {
  it("accepts a public HTTPS callback base and removes trailing slashes", () => {
    assert.equal(
      darajaCallbackBaseUrl("https://payments.example.com/api/payments/daraja/callback/"),
      "https://payments.example.com/api/payments/daraja/callback",
    );
  });

  it("reports missing, invalid, insecure, or incorrectly routed URLs as setup errors", () => {
    for (const value of [
      undefined,
      "not a URL",
      "http://payments.example.com/api/payments/daraja/callback",
      "https://localhost/api/payments/daraja/callback",
      "https://payments.example.com/",
    ]) {
      assert.throws(
        () => darajaCallbackBaseUrl(value),
        (error: unknown) => error instanceof ServiceUnavailableException && error.getStatus() === 503,
      );
    }
  });
});

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { JwtService } from "@nestjs/jwt";
import { ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { OAuthService } from "./oauth.service";
import { PrismaService } from "./prisma.service";

const envKeys = [
  "JWT_SECRET",
  "WEB_ORIGIN",
  "API_PUBLIC_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;
const originalValues = new Map(envKeys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of envKeys) {
    const original = originalValues.get(key);
    if (original === undefined) delete process.env[key];
    else process.env[key] = original;
  }
});

describe("OAuthService", () => {
  it("builds a Google authorization request with signed state, nonce, and PKCE", async () => {
    process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-oauth-state";
    process.env.WEB_ORIGIN = "http://localhost:3000";
    process.env.API_PUBLIC_URL = "http://localhost:4000";
    process.env.GOOGLE_CLIENT_ID = "google-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
    const service = new OAuthService({} as PrismaService, {} as JwtService);

    const result = await service.begin("google");
    const url = new URL(result.authorizationUrl);

    assert.equal(url.origin + url.pathname, "https://accounts.google.com/o/oauth2/v2/auth");
    assert.equal(url.searchParams.get("client_id"), "google-client-id");
    assert.equal(url.searchParams.get("redirect_uri"), "http://localhost:4000/api/auth/oauth/google/callback");
    assert.equal(url.searchParams.get("code_challenge_method"), "S256");
    assert.ok(url.searchParams.get("code_challenge"));
    assert.ok(url.searchParams.get("nonce"));
    assert.equal(result.callbackPath, "/api/auth/oauth/google/callback");
    assert.equal(result.secure, false);
    assert.equal(result.stateCookie.split(".").length, 5);
  });

  it("rejects callback state that does not match the signed state cookie", async () => {
    process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-oauth-state";
    const service = new OAuthService({} as PrismaService, {} as JwtService);

    await assert.rejects(
      service.complete("google", { code: "authorization-code", state: "attacker-state", stateCookie: undefined }),
      (error: unknown) => error instanceof UnauthorizedException,
    );
  });

  it("reports providers that have not been configured", async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    const service = new OAuthService({} as PrismaService, {} as JwtService);

    await assert.rejects(
      service.begin("google"),
      (error: unknown) => error instanceof ServiceUnavailableException && error.message.includes("Google sign-in is not configured"),
    );
  });
});

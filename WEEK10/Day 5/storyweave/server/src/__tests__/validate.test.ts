import { describe, it, expect } from "vitest";
import { passwordResetRequestSchema, passwordResetSchema, registerSchema, passwordSchema } from "../lib/validate";

describe("registerSchema", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      username: "writer_42",
      email: "writer@example.com",
      password: "passw0rd",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short usernames", () => {
    const result = registerSchema.safeParse({ username: "ab", email: "a@b.com", password: "passw0rd" });
    expect(result.success).toBe(false);
  });

  it("rejects usernames with special characters", () => {
    const result = registerSchema.safeParse({ username: "bad name!", email: "a@b.com", password: "passw0rd" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid emails", () => {
    const result = registerSchema.safeParse({ username: "valid_name", email: "not-an-email", password: "passw0rd" });
    expect(result.success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("requires at least 8 characters", () => {
    expect(passwordSchema.safeParse("a1b2c3").success).toBe(false);
    expect(passwordSchema.safeParse("a1b2c3d4").success).toBe(true);
  });

  it("requires both letters and numbers", () => {
    expect(passwordSchema.safeParse("abcdefgh").success).toBe(false);
    expect(passwordSchema.safeParse("12345678").success).toBe(false);
    expect(passwordSchema.safeParse("abcd1234").success).toBe(true);
  });
});

describe("password reset schemas", () => {
  it("normalizes the recovery email", () => {
    expect(passwordResetRequestSchema.parse({ email: " Writer@Example.com " }).email)
      .toBe("writer@example.com");
  });

  it("rejects weak replacement passwords", () => {
    expect(passwordResetSchema.safeParse({ token: "reset-token", password: "letters-only" }).success)
      .toBe(false);
    expect(passwordResetSchema.safeParse({ token: "reset-token", password: "words1234" }).success)
      .toBe(true);
  });
});

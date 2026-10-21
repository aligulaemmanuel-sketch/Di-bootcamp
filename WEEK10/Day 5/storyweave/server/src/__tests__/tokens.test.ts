import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "../lib/tokens";

describe("JWT tokens", () => {
  it("round-trips a signed token", () => {
    const token = signToken({ sub: "user-1", username: "sara" });
    const payload = verifyToken(token);
    expect(payload.sub).toBe("user-1");
    expect(payload.username).toBe("sara");
  });

  it("rejects a token signed with the wrong secret", () => {
    const foreign = require("jsonwebtoken").sign({ sub: "x", username: "x" }, "wrong-secret");
    expect(() => verifyToken(foreign)).toThrow();
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInvitationToken, hashInvitationToken } from "./invitation-token";

describe("member invitation tokens", () => {
  it("creates unique URL-safe tokens and stores only a one-way hash", () => {
    const first = createInvitationToken();
    const second = createInvitationToken();

    assert.match(first.token, /^[A-Za-z0-9_-]{43}$/);
    assert.notEqual(first.token, second.token);
    assert.equal(first.tokenHash, hashInvitationToken(first.token));
    assert.notEqual(first.tokenHash, first.token);
    assert.match(first.tokenHash, /^[a-f0-9]{64}$/);
  });
});

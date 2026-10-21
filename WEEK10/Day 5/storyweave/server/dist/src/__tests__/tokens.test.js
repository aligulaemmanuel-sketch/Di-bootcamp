"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tokens_1 = require("../lib/tokens");
(0, vitest_1.describe)("JWT tokens", () => {
    (0, vitest_1.it)("round-trips a signed token", () => {
        const token = (0, tokens_1.signToken)({ sub: "user-1", username: "sara" });
        const payload = (0, tokens_1.verifyToken)(token);
        (0, vitest_1.expect)(payload.sub).toBe("user-1");
        (0, vitest_1.expect)(payload.username).toBe("sara");
    });
    (0, vitest_1.it)("rejects a token signed with the wrong secret", () => {
        const foreign = require("jsonwebtoken").sign({ sub: "x", username: "x" }, "wrong-secret");
        (0, vitest_1.expect)(() => (0, tokens_1.verifyToken)(foreign)).toThrow();
    });
});

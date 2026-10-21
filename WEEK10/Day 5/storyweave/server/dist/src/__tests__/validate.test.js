"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const validate_1 = require("../lib/validate");
(0, vitest_1.describe)("registerSchema", () => {
    (0, vitest_1.it)("accepts a valid registration", () => {
        const result = validate_1.registerSchema.safeParse({
            username: "writer_42",
            email: "writer@example.com",
            password: "passw0rd",
        });
        (0, vitest_1.expect)(result.success).toBe(true);
    });
    (0, vitest_1.it)("rejects short usernames", () => {
        const result = validate_1.registerSchema.safeParse({ username: "ab", email: "a@b.com", password: "passw0rd" });
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("rejects usernames with special characters", () => {
        const result = validate_1.registerSchema.safeParse({ username: "bad name!", email: "a@b.com", password: "passw0rd" });
        (0, vitest_1.expect)(result.success).toBe(false);
    });
    (0, vitest_1.it)("rejects invalid emails", () => {
        const result = validate_1.registerSchema.safeParse({ username: "valid_name", email: "not-an-email", password: "passw0rd" });
        (0, vitest_1.expect)(result.success).toBe(false);
    });
});
(0, vitest_1.describe)("passwordSchema", () => {
    (0, vitest_1.it)("requires at least 8 characters", () => {
        (0, vitest_1.expect)(validate_1.passwordSchema.safeParse("a1b2c3").success).toBe(false);
        (0, vitest_1.expect)(validate_1.passwordSchema.safeParse("a1b2c3d4").success).toBe(true);
    });
    (0, vitest_1.it)("requires both letters and numbers", () => {
        (0, vitest_1.expect)(validate_1.passwordSchema.safeParse("abcdefgh").success).toBe(false);
        (0, vitest_1.expect)(validate_1.passwordSchema.safeParse("12345678").success).toBe(false);
        (0, vitest_1.expect)(validate_1.passwordSchema.safeParse("abcd1234").success).toBe(true);
    });
});

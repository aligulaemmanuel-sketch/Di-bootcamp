"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = exports.passwordSchema = exports.usernameSchema = void 0;
const zod_1 = require("zod");
exports.usernameSchema = zod_1.z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username: letters, numbers, underscores only");
exports.passwordSchema = zod_1.z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password needs at least one letter")
    .regex(/[0-9]/, "Password needs at least one number");
exports.registerSchema = zod_1.z.object({
    username: exports.usernameSchema,
    email: zod_1.z.string().email("Invalid email address"),
    password: exports.passwordSchema,
    bio: zod_1.z.string().max(300).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});

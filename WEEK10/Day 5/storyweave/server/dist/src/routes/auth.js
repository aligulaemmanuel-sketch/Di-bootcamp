"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const tokens_1 = require("../lib/tokens");
const validate_1 = require("../lib/validate");
const asyncHandler_1 = require("../lib/asyncHandler");
const auth_1 = require("../middleware/auth");
exports.authRouter = (0, express_1.Router)();
function publicUser(u) {
    return { id: u.id, email: u.email, username: u.username, bio: u.bio, avatarUrl: u.avatarUrl };
}
exports.authRouter.post("/register", (0, asyncHandler_1.ah)(async (req, res) => {
    const data = validate_1.registerSchema.parse(req.body);
    const existing = await prisma_1.prisma.user.findFirst({
        where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing)
        return res.status(409).json({ error: "Email or username is already taken." });
    const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
    const user = await prisma_1.prisma.user.create({
        data: { email: data.email, username: data.username, passwordHash, bio: data.bio ?? "" },
    });
    res.status(201).json({ user: publicUser(user), token: (0, tokens_1.signToken)({ sub: user.id, username: user.username }) });
}));
exports.authRouter.post("/login", (0, asyncHandler_1.ah)(async (req, res) => {
    const { email, password } = validate_1.loginSchema.parse(req.body);
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    const ok = await bcryptjs_1.default.compare(password, user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinva");
    if (!user || !ok)
        return res.status(401).json({ error: "Invalid credentials." });
    res.json({ user: publicUser(user), token: (0, tokens_1.signToken)({ sub: user.id, username: user.username }) });
}));
exports.authRouter.get("/me", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user)
        return res.status(404).json({ error: "User not found." });
    res.json({ user: publicUser(user) });
}));
exports.authRouter.patch("/me", auth_1.requireAuth, (0, asyncHandler_1.ah)(async (req, res) => {
    const { bio, avatarUrl } = req.body ?? {};
    const user = await prisma_1.prisma.user.update({
        where: { id: req.user.id },
        data: { ...(bio !== undefined && { bio: String(bio).slice(0, 300) }),
            ...(avatarUrl !== undefined && { avatarUrl: String(avatarUrl) }) },
    });
    res.json({ user: publicUser(user) });
}));

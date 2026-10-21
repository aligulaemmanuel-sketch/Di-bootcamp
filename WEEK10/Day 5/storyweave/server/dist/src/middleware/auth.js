"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const tokens_1 = require("../lib/tokens");
function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token)
        return res.status(401).json({ error: "Authentication required." });
    try {
        const payload = (0, tokens_1.verifyToken)(token);
        req.user = { id: payload.sub, username: payload.username };
        next();
    }
    catch {
        return res.status(401).json({ error: "Invalid or expired token." });
    }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const config_1 = require("../config");
const cloudinary_1 = require("cloudinary");
exports.uploadRouter = (0, express_1.Router)();
// Signs an upload so the browser can push avatars straight to Cloudinary
exports.uploadRouter.post("/avatar", auth_1.requireAuth, (_req, res) => {
    const { cloudName, apiKey, apiSecret } = config_1.config.cloudinary;
    if (!cloudName || !apiKey || !apiSecret) {
        return res.status(500).json({ error: "Cloudinary is not configured on the server." });
    }
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary_1.v2.utils.api_sign_request({ timestamp, folder: "avatars" }, apiSecret);
    res.json({ timestamp, signature, apiKey, cloudName, folder: "avatars" });
});

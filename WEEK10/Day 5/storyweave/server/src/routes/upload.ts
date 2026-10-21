import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { config } from "../config";
import { v2 as cloudinary } from "cloudinary";

export const uploadRouter = Router();

// Signs an upload so the browser can push avatars straight to Cloudinary
uploadRouter.post("/avatar", requireAuth, (_req, res) => {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: "Cloudinary is not configured on the server." });
  }
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder: "avatars" }, apiSecret);
  res.json({ timestamp, signature, apiKey, cloudName, folder: "avatars" });
});

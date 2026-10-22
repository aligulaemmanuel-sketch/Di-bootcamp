import { Router, type Response } from "express";
import { requireAuth } from "../middleware/auth";
import { config } from "../config";
import { v2 as cloudinary } from "cloudinary";

export const uploadRouter = Router();

function signUpload(folder: string, res: Response) {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: "Cloudinary is not configured on the server." });
  }
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);
  res.json({ timestamp, signature, apiKey, cloudName, folder });
}

uploadRouter.post("/avatar", requireAuth, (_req, res) => {
  signUpload("avatars", res);
});

uploadRouter.post("/profile-cover", requireAuth, (_req, res) => {
  signUpload("profile-covers", res);
});

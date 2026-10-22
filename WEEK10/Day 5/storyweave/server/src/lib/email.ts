import nodemailer from "nodemailer";
import { config } from "../config";

export function createEmailTransport() {
  if (!config.gmail.user || !config.gmail.appPassword || !config.gmail.from) {
    throw new Error("Gmail SMTP is not configured.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: config.gmail.user, pass: config.gmail.appPassword },
  });
}

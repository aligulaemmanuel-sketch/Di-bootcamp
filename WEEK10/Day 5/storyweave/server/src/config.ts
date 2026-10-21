import dotenv from "dotenv";
dotenv.config();

const required = ["DATABASE_URL", "JWT_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET!,
  tokenTtl: process.env.TOKEN_TTL || "12h",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};

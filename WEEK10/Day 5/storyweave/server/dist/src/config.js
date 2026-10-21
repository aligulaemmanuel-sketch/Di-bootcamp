"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const required = ["DATABASE_URL", "JWT_SECRET"];
for (const key of required) {
    if (!process.env[key]) {
        console.error(`Missing required env var: ${key}`);
        process.exit(1);
    }
}
exports.config = {
    port: Number(process.env.PORT || 4000),
    jwtSecret: process.env.JWT_SECRET,
    tokenTtl: process.env.TOKEN_TTL || "12h",
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
        apiKey: process.env.CLOUDINARY_API_KEY || "",
        apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    },
};

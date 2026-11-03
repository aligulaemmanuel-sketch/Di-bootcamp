import "dotenv/config";
import "reflect-metadata";
import cookieParser from "cookie-parser";
import express from "express";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be configured.");
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
    throw new Error("TRUST_PROXY_HOPS must be a non-negative integer.");
  }
  const cookieSameSite = (process.env.COOKIE_SAME_SITE ?? "lax").toLowerCase();
  if (!["lax", "none"].includes(cookieSameSite)) {
    throw new Error("COOKIE_SAME_SITE must be either lax or none.");
  }
  if (cookieSameSite === "none" && process.env.NODE_ENV !== "production") {
    throw new Error("COOKIE_SAME_SITE=none requires production HTTPS.");
  }
  const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.setGlobalPrefix("");
  app.getHttpAdapter().getInstance().set("trust proxy", trustProxyHops);
  app.enableCors({ origin: webOrigin, credentials: true });
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.enableShutdownHooks();
  await app.listen(Number(process.env.API_PORT ?? 4000), "0.0.0.0");
}

void bootstrap();

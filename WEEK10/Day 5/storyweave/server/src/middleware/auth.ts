import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/tokens";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; username: string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required." });

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

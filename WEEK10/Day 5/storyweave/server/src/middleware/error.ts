import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ errors: err.issues.map((i) => i.message) });
  }
  if (err instanceof Error) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
  return res.status(500).json({ error: "Unknown error" });
}

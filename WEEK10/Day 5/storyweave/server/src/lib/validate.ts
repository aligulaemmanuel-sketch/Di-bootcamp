import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username: letters, numbers, underscores only");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password needs at least one letter")
  .regex(/[0-9]/, "Password needs at least one number");

export const registerSchema = z.object({
  username: usernameSchema,
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  bio: z.string().max(300).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

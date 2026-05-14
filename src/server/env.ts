import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SERVER_PORT: z.coerce.number().int().positive().default(3333),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  PUBLIC_BASE_URL: z.string().url().optional(),
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().positive().max(20).default(8),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  DATABASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);

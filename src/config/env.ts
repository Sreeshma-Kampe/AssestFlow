import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/assetflow"),
  JWT_SECRET: z.string().min(1).default("development-secret"),
  NEXT_PUBLIC_APP_NAME: z.string().default("AssetFlow"),
  UPLOAD_PATH: z.string().default("./storage/uploads"),
});

export const env = envSchema.parse(process.env);

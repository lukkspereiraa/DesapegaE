import type { Request } from "express";
import multer from "multer";
import { env } from "./env";

const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
export function createImageUpload(): multer.Multer {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
      if (!allowedImageMimeTypes.has(file.mimetype)) {
        callback(new Error("Formato de imagem nao suportado. Use JPG, PNG, WEBP ou GIF."));
        return;
      }

      callback(null, true);
    },
  });
}

export function buildBlobImageUrl(req: Request, blobId: number): string {
  const baseUrl = env.PUBLIC_BASE_URL ?? `${req.protocol}://${req.get("host")}`;
  return `${baseUrl.replace(/\/+$/, "")}/media/${blobId}`;
}

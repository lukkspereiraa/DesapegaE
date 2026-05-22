import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { verifyAccessToken } from "./auth/tokens";
import { createContext } from "./context";
import { env } from "./env";
import { prisma } from "./prisma";
import { appRouter } from "./routers";
import {
  buildBlobImageUrl,
  createImageUpload,
} from "./uploads";

const app = express();
const uploadProfileImage = createImageUpload().single("image");
const uploadProductImages = createImageUpload().array("images", 10);

function toPrismaBytes(buffer: Buffer): Uint8Array<ArrayBuffer> {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const bytes = new Uint8Array(arrayBuffer);
  bytes.set(buffer);
  return bytes;
}

function requireUploadAuth(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401).json({ error: "Autenticacao obrigatoria." });
    return;
  }

  const token = authorization.slice(7);
  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ error: "Token invalido." });
    return;
  }

  next();
}

function sendUploadError(res: Response, error: unknown): void {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: `Imagem muito grande. Limite: ${env.UPLOAD_MAX_FILE_SIZE_MB}MB.` });
      return;
    }

    res.status(400).json({ error: "Falha no upload da imagem." });
    return;
  }

  if (error instanceof Error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: "Erro interno no upload." });
}

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/media/:blobId", async (req, res) => {
  const blobId = Number(req.params.blobId);
  if (!Number.isInteger(blobId) || blobId <= 0) {
    res.status(400).json({ error: "Blob id invalido." });
    return;
  }

  const imageBlob = await prisma.imageBlob.findUnique({
    where: { id: blobId },
    select: {
      data: true,
      mimeType: true,
      updatedAt: true,
    },
  });

  if (!imageBlob) {
    res.status(404).json({ error: "Imagem nao encontrada." });
    return;
  }

  res.setHeader("Content-Type", imageBlob.mimeType);
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.setHeader("Last-Modified", imageBlob.updatedAt.toUTCString());
  res.status(200).send(Buffer.from(imageBlob.data));
});

app.post("/upload/profile-image", requireUploadAuth, (req, res) => {
  uploadProfileImage(req, res, async (error) => {
    if (error) {
      sendUploadError(res, error);
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "Nenhuma imagem enviada." });
      return;
    }

    try {
      const blob = await prisma.imageBlob.create({
        data: {
          data: toPrismaBytes(req.file.buffer),
          mimeType: req.file.mimetype,
          fileName: req.file.originalname,
          sizeBytes: req.file.size,
        },
        select: { id: true },
      });

      res.status(201).json({
        image: {
          url: buildBlobImageUrl(req, blob.id),
          blobId: blob.id,
        },
      });
    } catch {
      res.status(500).json({ error: "Erro ao salvar imagem." });
    }
  });
});

app.post("/upload/product-images", requireUploadAuth, (req, res) => {
  uploadProductImages(req, res, async (error) => {
    if (error) {
      sendUploadError(res, error);
      return;
    }

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (!files.length) {
      res.status(400).json({ error: "Nenhuma imagem enviada." });
      return;
    }

    try {
      const blobs = await Promise.all(
        files.map((file) =>
          prisma.imageBlob.create({
            data: {
              data: toPrismaBytes(file.buffer),
              mimeType: file.mimetype,
              fileName: file.originalname,
              sizeBytes: file.size,
            },
            select: { id: true },
          }),
        ),
      );

      res.status(201).json({
        images: blobs.map((blob) => ({
          url: buildBlobImageUrl(req, blob.id),
          blobId: blob.id,
        })),
      });
    } catch {
      res.status(500).json({ error: "Erro ao salvar imagens." });
    }
  });
});

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.listen(env.SERVER_PORT, () => {
  console.log(`tRPC server running on http://localhost:${env.SERVER_PORT}/trpc`);
});

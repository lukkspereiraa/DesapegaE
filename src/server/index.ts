import cors from "cors";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./context";
import { env } from "./env";
import { appRouter } from "./routers";

const app = express();

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

import cors from "cors";
import express from "express";
import { prisma } from "./prisma.js";
import { advertisementRouter } from "./routes/advertisements.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/ads", advertisementRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3333;

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

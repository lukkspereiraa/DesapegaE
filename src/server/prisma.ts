import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "@prisma/client";

type GlobalPrisma = typeof globalThis & {
  __prisma?: PrismaClient;
};

const globalPrisma = globalThis as GlobalPrisma;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to start PrismaClient.');
}

const adapter = new PrismaPg({ connectionString });

export const prisma =
  globalPrisma.__prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalPrisma.__prisma = prisma;
}

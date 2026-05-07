import { config as dotenvConfig } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the root .env so the backend uses the existing DATABASE_URL.
dotenvConfig({ path: path.resolve(__dirname, "../../.env") });

const connectionString = process.env["DATABASE_URL"];
if (!connectionString) {
	throw new Error("DATABASE_URL is not set");
}

export const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString }),
});

import type { RoleName } from "@prisma/client";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { verifyAccessToken } from "./auth/tokens";
import { prisma } from "./prisma";

export type AuthUser = {
  id: number;
  role: RoleName;
};

export async function createContext({ req, res }: CreateExpressContextOptions) {
  let user: AuthUser | null = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);

    if (payload?.sub) {
      const userId = Number(payload.sub);
      if (Number.isInteger(userId) && userId > 0) {
        user = {
          id: userId,
          role: payload.role,
        };
      }
    }
  }

  return {
    req,
    res,
    prisma,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

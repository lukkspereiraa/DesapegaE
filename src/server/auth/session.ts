import { TRPCError } from "@trpc/server";
import { type Prisma, type PrismaClient, type RoleName, UserStatus } from "@prisma/client";
import { generateAccessToken, generateRefreshToken, hashToken, verifyRefreshToken } from "./tokens";
import { userProfileSelect, serializeUserProfile } from "../serializers";

type PrismaLike = PrismaClient | Prisma.TransactionClient;

async function getActiveUser(prisma: PrismaLike, userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userProfileSelect,
  });

  if (!user || user.status !== UserStatus.Active) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuario invalido ou bloqueado." });
  }

  if (!user.role) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuario sem permissao configurada." });
  }

  return user;
}

export async function createSessionTokens(
  prisma: PrismaLike,
  params: { userId: number; role: RoleName },
) {
  const accessToken = generateAccessToken(params.userId, params.role);
  const refresh = generateRefreshToken(params.userId);

  await prisma.refreshToken.create({
    data: {
      jti: refresh.jti,
      tokenHash: hashToken(refresh.token),
      userId: params.userId,
      expiresAt: refresh.expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: refresh.token,
  };
}

export async function rotateSessionTokens(prisma: PrismaLike, rawRefreshToken: string) {
  const payload = verifyRefreshToken(rawRefreshToken);

  if (!payload) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Refresh token invalido." });
  }

  const userId = Number(payload.sub);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Refresh token invalido." });
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { jti: payload.jti },
  });

  if (!storedToken || storedToken.userId !== userId || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessao expirada." });
  }

  if (storedToken.tokenHash !== hashToken(rawRefreshToken)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Refresh token invalido." });
  }

  const user = await getActiveUser(prisma, userId);

  await prisma.refreshToken.update({
    where: { jti: payload.jti },
    data: { revokedAt: new Date() },
  });

  const roleName = user.role?.name;
  if (!roleName) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Conta sem permissao configurada.' });
  }

  const tokens = await createSessionTokens(prisma, {
    userId,
    role: roleName,
  });

  return {
    ...tokens,
    user: serializeUserProfile(user),
  };
}

export async function revokeSessionToken(prisma: PrismaLike, rawRefreshToken: string) {
  const payload = verifyRefreshToken(rawRefreshToken);

  if (!payload) {
    return;
  }

  await prisma.refreshToken.updateMany({
    where: {
      jti: payload.jti,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

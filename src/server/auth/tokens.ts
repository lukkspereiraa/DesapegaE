import crypto from "node:crypto";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { type RoleName } from "@prisma/client";
import { env } from "../env";

export type AccessTokenPayload = JwtPayload & {
  sub: string;
  role: RoleName;
  tokenType: "access";
};

export type RefreshTokenPayload = JwtPayload & {
  sub: string;
  jti: string;
  tokenType: "refresh";
};

function parseDurationToMs(value: string): number {
  const match = /^(\d+)([smhd])$/i.exec(value.trim());
  if (!match) {
    throw new Error(`Unsupported duration format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid duration value: ${value}`);
  }

  const unitToMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitToMs[unit];
}

function asExpiresIn(value: string): SignOptions["expiresIn"] {
  return value as SignOptions["expiresIn"];
}

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function generateAccessToken(userId: number, role: RoleName): string {
  return jwt.sign(
    {
      sub: String(userId),
      role,
      tokenType: "access",
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: asExpiresIn(env.JWT_ACCESS_EXPIRES_IN),
    },
  );
}

export function generateRefreshToken(userId: number): {
  token: string;
  jti: string;
  expiresAt: Date;
} {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    {
      sub: String(userId),
      jti,
      tokenType: "refresh",
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: asExpiresIn(env.JWT_REFRESH_EXPIRES_IN),
    },
  );

  const expiresAt = new Date(Date.now() + parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN));

  return { token, jti, expiresAt };
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    if (payload.tokenType !== "access") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    if (payload.tokenType !== "refresh") {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

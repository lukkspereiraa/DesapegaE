import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../server/routers";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type SessionUser = RouterOutput["auth"]["me"];

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

const AUTH_STORAGE_KEY = "desapegae-auth-session";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function getAuthSession(): AuthSession | null {
  if (!canUseStorage()) return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.accessToken || !parsed?.refreshToken || !parsed?.user?.id) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession): void {
  if (!canUseStorage()) return;

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem("user", JSON.stringify(session.user));
  localStorage.setItem("userId", String(session.user.id));
}

export function clearAuthSession(): void {
  if (!canUseStorage()) return;

  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
}

export function getAccessToken(): string | null {
  return getAuthSession()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getAuthSession()?.refreshToken ?? null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

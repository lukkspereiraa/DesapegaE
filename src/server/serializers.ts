import { type Prisma } from "@prisma/client";
import { env } from "./env";

const mediaBaseUrl = (env.PUBLIC_BASE_URL ?? `http://localhost:${env.SERVER_PORT}`).replace(/\/+$/, "");

export function resolveUserAvatarUrl(avatarBlobId?: number | null, legacyAvatarUrl?: string | null): string | null {
  if (avatarBlobId) {
    return `${mediaBaseUrl}/media/${avatarBlobId}`;
  }

  return legacyAvatarUrl ?? null;
}

export const userProfileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  instagram: true,
  avatarUrl: true,
  avatarBlobId: true,
  status: true,
  role: {
    select: {
      name: true,
    },
  },
  address: {
    select: {
      id: true,
      neighborhood: true,
      postalCode: true,
      street: true,
      number: true,
      complement: true,
      city: {
        select: {
          id: true,
          name: true,
          state: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

export type UserProfilePayload = Prisma.UserGetPayload<{ select: typeof userProfileSelect }>;

export function serializeUserProfile(user: UserProfilePayload) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    instagram: user.instagram,
    avatarUrl: resolveUserAvatarUrl(user.avatarBlobId, user.avatarUrl),
    status: user.status,
    role: user.role?.name ?? 'Guest',
    address: {
      id: user.address.id,
      neighborhood: user.address.neighborhood,
      postalCode: user.address.postalCode,
      street: user.address.street,
      number: user.address.number,
      complement: user.address.complement,
      city: {
        id: user.address.city.id,
        name: user.address.city.name,
        state: {
          id: user.address.city.state.id,
          name: user.address.city.state.name,
          code: user.address.city.state.code,
        },
      },
    },
  };
}

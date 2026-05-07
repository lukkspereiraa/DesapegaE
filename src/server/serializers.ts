import { type Prisma } from "@prisma/client";

export const userProfileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  instagram: true,
  avatarUrl: true,
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
    avatarUrl: user.avatarUrl,
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

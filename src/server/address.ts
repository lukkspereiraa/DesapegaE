import { type Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";

type PrismaLike = PrismaClient | Prisma.TransactionClient;

export const addressInputSchema = z.object({
  stateCode: z.string().trim().min(2).max(8),
  stateName: z.string().trim().min(2).max(120),
  cityName: z.string().trim().min(2).max(120),
  neighborhood: z.string().trim().min(2).max(120),
  postalCode: z.string().trim().min(8).max(16),
  street: z.string().trim().min(2).max(180).optional(),
  number: z.string().trim().min(1).max(32).optional(),
  complement: z.string().trim().max(120).optional(),
});

export type AddressInput = z.infer<typeof addressInputSchema>;

export async function resolveAddressId(prisma: PrismaLike, input: AddressInput): Promise<number> {
  const normalized = {
    stateCode: input.stateCode.toUpperCase(),
    stateName: input.stateName,
    cityName: input.cityName,
    neighborhood: input.neighborhood,
    postalCode: input.postalCode,
    street: input.street ?? null,
    number: input.number ?? null,
    complement: input.complement ?? null,
  };

  const state = await prisma.state.upsert({
    where: { code: normalized.stateCode },
    create: {
      code: normalized.stateCode,
      name: normalized.stateName,
    },
    update: {
      name: normalized.stateName,
    },
    select: { id: true },
  });

  const city = await prisma.city.upsert({
    where: {
      name_stateId: {
        name: normalized.cityName,
        stateId: state.id,
      },
    },
    create: {
      name: normalized.cityName,
      stateId: state.id,
    },
    update: {},
    select: { id: true },
  });

  const existingAddress = await prisma.address.findFirst({
    where: {
      cityId: city.id,
      neighborhood: normalized.neighborhood,
      postalCode: normalized.postalCode,
      street: normalized.street,
      number: normalized.number,
      complement: normalized.complement,
    },
    select: { id: true },
  });

  if (existingAddress) {
    return existingAddress.id;
  }

  const createdAddress = await prisma.address.create({
    data: {
      cityId: city.id,
      neighborhood: normalized.neighborhood,
      postalCode: normalized.postalCode,
      street: normalized.street,
      number: normalized.number,
      complement: normalized.complement,
    },
    select: { id: true },
  });

  return createdAddress.id;
}

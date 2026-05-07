import { AdvertisementStatus, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

const publicListInputSchema = z
  .object({
    search: z.string().trim().min(1).optional(),
    categoryId: z.number().int().positive().optional(),
    minPrice: z.number().int().nonnegative().optional(),
    maxPrice: z.number().int().nonnegative().optional(),
  })
  .optional();

const createProductInputSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(5).max(5000),
  price: z.number().int().nonnegative(),
  conditions: z.string().trim().min(2).max(60),
  categoryId: z.number().int().positive(),
  pictures: z.array(z.string().url()).max(10).optional(),
});

const updateProductInputSchema = z
  .object({
    id: z.number().int().positive(),
    title: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().min(5).max(5000).optional(),
    price: z.number().int().nonnegative().optional(),
    conditions: z.string().trim().min(2).max(60).optional(),
    categoryId: z.number().int().positive().optional(),
    pictures: z.array(z.string().url()).max(10).optional(),
    status: z.nativeEnum(AdvertisementStatus).optional(),
  })
  .refine(
    (input) =>
      input.title !== undefined ||
      input.description !== undefined ||
      input.price !== undefined ||
      input.conditions !== undefined ||
      input.categoryId !== undefined ||
      input.pictures !== undefined ||
      input.status !== undefined,
    {
      message: "Nenhum campo para atualizar.",
    },
  );

const deleteProductInputSchema = z.object({
  id: z.number().int().positive(),
});

const setStatusInputSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum([AdvertisementStatus.Open, AdvertisementStatus.Closed]),
});

const advertisementSelect = {
  id: true,
  title: true,
  description: true,
  price: true,
  conditions: true,
  status: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  pictures: {
    select: {
      id: true,
      url: true,
    },
    orderBy: {
      id: "asc",
    },
  },
  advertiser: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      phone: true,
      instagram: true,
      address: {
        select: {
          neighborhood: true,
          postalCode: true,
          city: {
            select: {
              name: true,
              state: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.AdvertisementSelect;

async function ensureOwner(prisma: Prisma.TransactionClient | Prisma.DefaultPrismaClient, adId: number, userId: number) {
  const ad = await prisma.advertisement.findUnique({
    where: { id: adId },
    select: {
      id: true,
      advertiserId: true,
    },
  });

  if (!ad) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Anuncio nao encontrado." });
  }

  if (ad.advertiserId !== userId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Sem permissao para alterar este anuncio." });
  }
}

export const productRouter = router({
  listPublic: publicProcedure.input(publicListInputSchema).query(async ({ ctx, input }) => {
    const where: Prisma.AdvertisementWhereInput = {
      status: AdvertisementStatus.Open,
    };

    if (input?.categoryId) {
      where.categoryId = input.categoryId;
    }

    if (input?.search) {
      where.OR = [
        { title: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: "insensitive" } },
      ];
    }

    if (input?.minPrice !== undefined || input?.maxPrice !== undefined) {
      where.price = {
        gte: input?.minPrice,
        lte: input?.maxPrice,
      };
    }

    return ctx.prisma.advertisement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: advertisementSelect,
    });
  }),

  byId: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const ad = await ctx.prisma.advertisement.findFirst({
      where: {
        id: input.id,
        status: {
          not: AdvertisementStatus.Blocked,
        },
      },
      select: advertisementSelect,
    });

    if (!ad) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Anuncio nao encontrado." });
    }

    return ad;
  }),

  myAds: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.advertisement.findMany({
      where: { advertiserId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      select: advertisementSelect,
    });
  }),

  create: protectedProcedure.input(createProductInputSchema).mutation(async ({ ctx, input }) => {
    const category = await ctx.prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Categoria invalida." });
    }

    return ctx.prisma.advertisement.create({
      data: {
        advertiserId: ctx.user.id,
        title: input.title,
        description: input.description,
        price: input.price,
        conditions: input.conditions,
        categoryId: input.categoryId,
        pictures: input.pictures?.length
          ? {
              create: input.pictures.map((url) => ({ url })),
            }
          : undefined,
      },
      select: advertisementSelect,
    });
  }),

  update: protectedProcedure.input(updateProductInputSchema).mutation(async ({ ctx, input }) => {
    await ensureOwner(ctx.prisma, input.id, ctx.user.id);

    if (input.categoryId !== undefined) {
      const category = await ctx.prisma.category.findUnique({
        where: { id: input.categoryId },
        select: { id: true },
      });

      if (!category) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Categoria invalida." });
      }
    }

    const data: Prisma.AdvertisementUpdateInput = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.price !== undefined) data.price = input.price;
    if (input.conditions !== undefined) data.conditions = input.conditions;
    if (input.categoryId !== undefined) data.category = { connect: { id: input.categoryId } };
    if (input.status !== undefined) data.status = input.status;

    if (input.pictures !== undefined) {
      return ctx.prisma.$transaction(async (tx) => {
        await tx.advertisementPicture.deleteMany({
          where: { advertisementId: input.id },
        });

        return tx.advertisement.update({
          where: { id: input.id },
          data: {
            ...data,
            pictures: input.pictures?.length
              ? {
                  create: input.pictures.map((url) => ({ url })),
                }
              : undefined,
          },
          select: advertisementSelect,
        });
      });
    }

    return ctx.prisma.advertisement.update({
      where: { id: input.id },
      data,
      select: advertisementSelect,
    });
  }),

  setStatus: protectedProcedure.input(setStatusInputSchema).mutation(async ({ ctx, input }) => {
    await ensureOwner(ctx.prisma, input.id, ctx.user.id);

    return ctx.prisma.advertisement.update({
      where: { id: input.id },
      data: { status: input.status },
      select: advertisementSelect,
    });
  }),

  delete: protectedProcedure.input(deleteProductInputSchema).mutation(async ({ ctx, input }) => {
    await ensureOwner(ctx.prisma, input.id, ctx.user.id);

    await ctx.prisma.advertisement.delete({
      where: { id: input.id },
    });

    return { success: true };
  }),
});

import { AdvertisementStatus, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { deleteImageBlobIfUnused } from "../blob";
import { resolveUserAvatarUrl } from "../serializers";

const publicListInputSchema = z
  .object({
    search: z.string().trim().min(1).optional(),
    categoryId: z.number().int().positive().optional(),
    minPrice: z.number().int().nonnegative().optional(),
    maxPrice: z.number().int().nonnegative().optional(),
  })
  .optional();

const pictureInputSchema = z.object({
  url: z.string().trim().min(1),
  blobId: z.number().int().positive().optional(),
});

const createProductInputSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(5).max(5000),
  price: z.number().int().nonnegative(),
  conditions: z.string().trim().min(2).max(60),
  categoryId: z.number().int().positive(),
  pictures: z.array(pictureInputSchema).max(10).optional(),
});

const updateProductInputSchema = z
  .object({
    id: z.number().int().positive(),
    title: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().min(5).max(5000).optional(),
    price: z.number().int().nonnegative().optional(),
    conditions: z.string().trim().min(2).max(60).optional(),
    categoryId: z.number().int().positive().optional(),
    pictures: z.array(pictureInputSchema).max(10).optional(),
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
      blobId: true,
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
      avatarBlobId: true,
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

type AdvertisementPayload = Prisma.AdvertisementGetPayload<{ select: typeof advertisementSelect }>;

function serializeAdvertisement(ad: AdvertisementPayload): AdvertisementPayload {
  return {
    ...ad,
    advertiser: {
      ...ad.advertiser,
      avatarUrl: resolveUserAvatarUrl(ad.advertiser.avatarBlobId, ad.advertiser.avatarUrl),
    },
  };
}

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

async function ensureImageBlobsExist(
  prisma: Prisma.TransactionClient | Prisma.DefaultPrismaClient,
  pictures?: Array<{ blobId?: number }>,
) {
  const blobIds = Array.from(new Set((pictures ?? []).map((picture) => picture.blobId).filter(Boolean))) as number[];

  if (!blobIds.length) {
    return;
  }

  const existingBlobIds = await prisma.imageBlob.findMany({
    where: { id: { in: blobIds } },
    select: { id: true },
  });

  if (existingBlobIds.length !== blobIds.length) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Uma ou mais imagens enviadas sao invalidas." });
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

    const ads = await ctx.prisma.advertisement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: advertisementSelect,
    });

    return ads.map(serializeAdvertisement);
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

    return serializeAdvertisement(ad);
  }),

  myAds: protectedProcedure.query(async ({ ctx }) => {
    const ads = await ctx.prisma.advertisement.findMany({
      where: { advertiserId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      select: advertisementSelect,
    });

    return ads.map(serializeAdvertisement);
  }),

  create: protectedProcedure.input(createProductInputSchema).mutation(async ({ ctx, input }) => {
    const category = await ctx.prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Categoria invalida." });
    }

    await ensureImageBlobsExist(ctx.prisma, input.pictures);

    const createdAd = await ctx.prisma.advertisement.create({
      data: {
        advertiserId: ctx.user.id,
        title: input.title,
        description: input.description,
        price: input.price,
        conditions: input.conditions,
        categoryId: input.categoryId,
        pictures: input.pictures?.length
          ? {
              create: input.pictures.map((picture) => ({
                url: picture.url,
                blobId: picture.blobId,
              })),
            }
          : undefined,
      },
      select: advertisementSelect,
    });

    return serializeAdvertisement(createdAd);
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

    if (input.pictures !== undefined) {
      await ensureImageBlobsExist(ctx.prisma, input.pictures);
    }

    const data: Prisma.AdvertisementUpdateInput = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.price !== undefined) data.price = input.price;
    if (input.conditions !== undefined) data.conditions = input.conditions;
    if (input.categoryId !== undefined) data.category = { connect: { id: input.categoryId } };
    if (input.status !== undefined) data.status = input.status;

    if (input.pictures !== undefined) {
      const previousPictures = await ctx.prisma.advertisementPicture.findMany({
        where: { advertisementId: input.id },
        select: { blobId: true },
      });

      const updatedAd = await ctx.prisma.$transaction(async (tx) => {
        await tx.advertisementPicture.deleteMany({
          where: { advertisementId: input.id },
        });

        return tx.advertisement.update({
          where: { id: input.id },
          data: {
            ...data,
            pictures: input.pictures?.length
              ? {
                  create: input.pictures.map((picture) => ({
                    url: picture.url,
                    blobId: picture.blobId,
                  })),
                }
              : undefined,
          },
          select: advertisementSelect,
        });
      });

      await Promise.all(previousPictures.map((picture) => deleteImageBlobIfUnused(ctx.prisma, picture.blobId)));

      return serializeAdvertisement(updatedAd);
    }

    const updatedAd = await ctx.prisma.advertisement.update({
      where: { id: input.id },
      data,
      select: advertisementSelect,
    });

    return serializeAdvertisement(updatedAd);
  }),

  setStatus: protectedProcedure.input(setStatusInputSchema).mutation(async ({ ctx, input }) => {
    await ensureOwner(ctx.prisma, input.id, ctx.user.id);

    const updatedAd = await ctx.prisma.advertisement.update({
      where: { id: input.id },
      data: { status: input.status },
      select: advertisementSelect,
    });

    return serializeAdvertisement(updatedAd);
  }),

  delete: protectedProcedure.input(deleteProductInputSchema).mutation(async ({ ctx, input }) => {
    await ensureOwner(ctx.prisma, input.id, ctx.user.id);

    const existingPictures = await ctx.prisma.advertisementPicture.findMany({
      where: { advertisementId: input.id },
      select: { blobId: true },
    });

    await ctx.prisma.advertisement.delete({
      where: { id: input.id },
    });

    await Promise.all(existingPictures.map((picture) => deleteImageBlobIfUnused(ctx.prisma, picture.blobId)));

    return { success: true };
  }),
});

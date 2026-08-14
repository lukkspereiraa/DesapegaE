import { AdvertisementStatus, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";
import { deleteImageBlobIfUnused } from "../blob";
import { resolveUserAvatarUrl } from "../serializers";
import { addressInputSchema, resolveAddressId } from "../address";

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
  useProfileAddress: z.boolean().optional(),
  address: addressInputSchema.optional(),
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
    useProfileAddress: z.boolean().optional(),
    address: addressInputSchema.optional(),
  })
  .refine(
    (input) =>
      input.title !== undefined ||
      input.description !== undefined ||
      input.price !== undefined ||
      input.conditions !== undefined ||
      input.categoryId !== undefined ||
      input.pictures !== undefined ||
      input.status !== undefined ||
      input.useProfileAddress !== undefined ||
      input.address !== undefined,
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
  address: {
    select: {
      id: true,
      stateCode: true,
      stateName: true,
      cityName: true,
      neighborhood: true,
      postalCode: true,
      street: true,
      number: true,
      complement: true,
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
          stateCode: true,
          stateName: true,
          cityName: true,
          neighborhood: true,
          postalCode: true,
          street: true,
          number: true,
          complement: true,
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
  listCategories: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  }),

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

    let userFavoriteIds: number[] = [];
    if (ctx.user) {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          favorites: {
            select: { id: true },
          },
        },
      });
      userFavoriteIds = user?.favorites.map((f) => f.id) ?? [];
    }

    return ads.map((ad) => ({
      ...serializeAdvertisement(ad),
      isFavorited: userFavoriteIds.includes(ad.id),
    }));
  }),

  listFavorites: protectedProcedure.query(async ({ ctx }) => {
    const ads = await ctx.prisma.advertisement.findMany({
      where: {
        favoritedBy: {
          some: { id: ctx.user.id },
        },
      },
      orderBy: { createdAt: "desc" },
      select: advertisementSelect,
    });

    return ads.map((ad) => ({
      ...serializeAdvertisement(ad),
      isFavorited: true, // by definition, they are favorited
    }));
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

    let isFavorited = false;
    if (ctx.user) {
      const favorite = await ctx.prisma.advertisement.findFirst({
        where: {
          id: input.id,
          favoritedBy: {
            some: {
              id: ctx.user.id,
            },
          },
        },
        select: { id: true },
      });
      isFavorited = !!favorite;
    }

    return {
      ...serializeAdvertisement(ad),
      isFavorited,
    };
  }),

  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const ad = await ctx.prisma.advertisement.findUnique({
        where: { id: input.id },
        select: { id: true },
      });

      if (!ad) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Anuncio nao encontrado." });
      }

      const existingFavorite = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.user.id,
          favorites: {
            some: { id: input.id },
          },
        },
        select: { id: true },
      });

      if (existingFavorite) {
        await ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            favorites: {
              disconnect: { id: input.id },
            },
          },
        });
        return { favorited: false };
      } else {
        await ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            favorites: {
              connect: { id: input.id },
            },
          },
        });
        return { favorited: true };
      }
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

    let addressId: number;
    if (input.useProfileAddress || !input.address) {
      const user = await ctx.prisma.user.findUniqueOrThrow({ where: { id: ctx.user.id } });
      addressId = user.addressId;
    } else {
      addressId = await resolveAddressId(ctx.prisma, input.address);
    }

    const createdAd = await ctx.prisma.advertisement.create({
      data: {
        advertiserId: ctx.user.id,
        title: input.title,
        description: input.description,
        price: input.price,
        conditions: input.conditions,
        categoryId: input.categoryId,
        addressId,
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

    if (input.useProfileAddress) {
      const user = await ctx.prisma.user.findUniqueOrThrow({ where: { id: ctx.user.id } });
      data.address = { connect: { id: user.addressId } };
    } else if (input.address) {
      const addressId = await resolveAddressId(ctx.prisma, input.address);
      data.address = { connect: { id: addressId } };
    }

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

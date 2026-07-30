import { Prisma, UserStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addressInputSchema, resolveAddressId } from "../address";
import { deleteImageBlobIfUnused } from "../blob";
import { serializeUserProfile, userProfileSelect, resolveUserAvatarUrl } from "../serializers";
import { publicProcedure, protectedProcedure, router } from "../trpc";

const updateProfileInputSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
  phone: z.string().trim().min(8).max(25).optional(),
  instagram: z.string().trim().max(80).nullable().optional(),
  avatarBlobId: z.number().int().positive().nullable().optional(),
  address: addressInputSchema.optional(),
});

const getVendedorInputSchema = z.object({
  id: z.number().int().positive(),
});

const evaluateSellerInputSchema = z.object({
  sellerId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
});

export const userRouter = router({
  getVendedor: publicProcedure
    .input(getVendedorInputSchema)
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          phone: true,
          avatarUrl: true,
          avatarBlobId: true,
          status: true,
          createdAt: true,
          role: { select: { name: true } },
          address: {
            select: {
              cityName: true,
              neighborhood: true,
            },
          },
          advertisements: {
            where: { status: "Open" },
            select: {
              id: true,
              title: true,
              price: true,
              address: {
                select: {
                  cityName: true,
                  neighborhood: true,
                }
              },
              pictures: {
                take: 1,
                select: {
                  url: true,
                  blobId: true,
                },
                orderBy: {
                  id: "asc"
                }
              },
            },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              user: {
                select: {
                  name: true,
                  avatarUrl: true,
                  avatarBlobId: true,
                }
              },
              advertisement: {
                select: {
                  title: true,
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          sellerReviewsReceived: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              reviewerId: true,
              reviewer: {
                select: {
                  name: true,
                  avatarUrl: true,
                  avatarBlobId: true,
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!user || user.status !== UserStatus.Active) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendedor não encontrado." });
      }

      const salesCount = await ctx.prisma.advertisement.count({
        where: {
          advertiserId: input.id,
          status: "Closed"
        }
      });

      const isOwnProfile = ctx.user?.id === input.id;
      const hasReviewed = ctx.user ? user.sellerReviewsReceived.some(r => r.reviewerId === ctx.user?.id) : false;

      const { advertisements, reviews, sellerReviewsReceived, ...userData } = user;

      const formattedAdReviews = reviews.map(r => ({
        id: `ad-${r.id}`,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: {
          name: r.user.name,
          avatarUrl: resolveUserAvatarUrl(r.user.avatarBlobId, r.user.avatarUrl)
        },
        advertisement: {
          title: r.advertisement.title
        }
      }));

      const formattedSellerReviews = sellerReviewsReceived.map(r => ({
        id: `seller-${r.id}`,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: {
          name: r.reviewer.name,
          avatarUrl: resolveUserAvatarUrl(r.reviewer.avatarBlobId, r.reviewer.avatarUrl)
        },
        advertisement: {
          title: "Avaliação direta ao vendedor"
        }
      }));

      const allReviews = [...formattedAdReviews, ...formattedSellerReviews].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      return {
        ...serializeUserProfile(userData as any), // reuse serialization for avatarUrl
        phone: userData.phone,
        createdAt: userData.createdAt,
        salesCount,
        advertisements,
        reviews: allReviews,
        isOwnProfile,
        hasReviewed
      };
    }),

  evaluateSeller: protectedProcedure
    .input(evaluateSellerInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.sellerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Você não pode avaliar a si mesmo." });
      }

      const seller = await ctx.prisma.user.findUnique({
        where: { id: input.sellerId },
      });

      if (!seller || seller.status !== UserStatus.Active) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vendedor não encontrado ou inativo." });
      }

      const existingReview = await ctx.prisma.sellerReview.findFirst({
        where: {
          sellerId: input.sellerId,
          reviewerId: ctx.user.id,
        },
      });

      if (existingReview) {
        throw new TRPCError({ code: "CONFLICT", message: "Você já avaliou este vendedor." });
      }

      const review = await ctx.prisma.sellerReview.create({
        data: {
          sellerId: input.sellerId,
          reviewerId: ctx.user.id,
          rating: input.rating,
          comment: input.comment,
        },
      });

      return review;
    }),

  profile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: userProfileSelect,
    });

    if (!user || user.status !== UserStatus.Active) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuario nao encontrado." });
    }

    return serializeUserProfile(user);
  }),

  updateProfile: protectedProcedure
    .input(updateProfileInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (
        input.name === undefined &&
        input.email === undefined &&
        input.phone === undefined &&
        input.instagram === undefined &&
        input.avatarBlobId === undefined &&
        input.address === undefined
      ) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nenhum campo para atualizar." });
      }

      if (input.avatarBlobId !== undefined && input.avatarBlobId !== null) {
        const blobExists = await ctx.prisma.imageBlob.findUnique({
          where: { id: input.avatarBlobId },
          select: { id: true },
        });

        if (!blobExists) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Imagem de avatar invalida." });
        }
      }

      const data: Prisma.UserUpdateInput = {};
      const previousAvatarBlobId =
        input.avatarBlobId !== undefined
          ? (
              await ctx.prisma.user.findUnique({
                where: { id: ctx.user.id },
                select: { avatarBlobId: true },
              })
            )?.avatarBlobId ?? null
          : null;

      if (input.name !== undefined) data.name = input.name;
      if (input.email !== undefined) {
        const emailInUse = await ctx.prisma.user.findFirst({
          where: {
            email: input.email,
            NOT: {
              id: ctx.user.id,
            },
          },
          select: { id: true },
        });

        if (emailInUse) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Email ja em uso.' });
        }

        data.email = input.email;
      }
      if (input.phone !== undefined) data.phone = input.phone;
      if (input.instagram !== undefined) data.instagram = input.instagram;

      if (input.avatarBlobId !== undefined) {
        data.avatarBlob =
          input.avatarBlobId === null
            ? { disconnect: true }
            : { connect: { id: input.avatarBlobId } };

        data.avatarUrl = null;
      }

      if (input.address) {
        const addressId = await resolveAddressId(ctx.prisma, input.address);
        data.address = {
          connect: { id: addressId },
        };
      }

      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data,
        select: userProfileSelect,
      });

      if (input.avatarBlobId !== undefined) {
        const nextAvatarBlobId = input.avatarBlobId;

        if (previousAvatarBlobId && previousAvatarBlobId !== nextAvatarBlobId) {
          await deleteImageBlobIfUnused(ctx.prisma, previousAvatarBlobId);
        }
      }

      return serializeUserProfile(updatedUser);
    }),
});

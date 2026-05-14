import { Prisma, UserStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addressInputSchema, resolveAddressId } from "../address";
import { deleteImageBlobIfUnused } from "../blob";
import { serializeUserProfile, userProfileSelect } from "../serializers";
import { protectedProcedure, router } from "../trpc";

const updateProfileInputSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
  phone: z.string().trim().min(8).max(25).optional(),
  instagram: z.string().trim().max(80).nullable().optional(),
  avatarBlobId: z.number().int().positive().nullable().optional(),
  address: addressInputSchema.optional(),
});

export const userRouter = router({
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

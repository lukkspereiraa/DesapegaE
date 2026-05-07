import { Prisma, UserStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addressInputSchema, resolveAddressId } from "../address";
import { serializeUserProfile, userProfileSelect } from "../serializers";
import { protectedProcedure, router } from "../trpc";

const updateProfileInputSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
  phone: z.string().trim().min(8).max(25).optional(),
  instagram: z.string().trim().max(80).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
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
        input.avatarUrl === undefined &&
        input.address === undefined
      ) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nenhum campo para atualizar." });
      }

      const data: Prisma.UserUpdateInput = {};

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
      if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;

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

      return serializeUserProfile(updatedUser);
    }),
});

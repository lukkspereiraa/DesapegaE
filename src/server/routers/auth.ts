import bcrypt from "bcryptjs";
import { RoleName, UserStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { addressInputSchema, resolveAddressId } from "../address";
import { createSessionTokens, revokeSessionToken, rotateSessionTokens } from "../auth/session";
import { serializeUserProfile, userProfileSelect } from "../serializers";
import { protectedProcedure, publicProcedure, router } from "../trpc";

const registerInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6).max(100),
  phone: z.string().trim().min(8).max(25),
  instagram: z.string().trim().max(80).optional(),
  avatarUrl: z.string().url().optional(),
  address: addressInputSchema,
});

const loginInputSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6).max(100),
});

const refreshInputSchema = z.object({
  refreshToken: z.string().min(1),
});

export const authRouter = router({
  register: publicProcedure.input(registerInputSchema).mutation(async ({ ctx, input }) => {
    const existingUser = await ctx.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new TRPCError({ code: "CONFLICT", message: "Email ja cadastrado." });
    }

    const advertiserRole = await ctx.prisma.role.findUnique({
      where: { name: RoleName.Advertiser },
      select: { id: true, name: true },
    });

    if (!advertiserRole) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Perfil de anunciante nao encontrado." });
    }

    const addressId = await resolveAddressId(ctx.prisma, input.address);
    const passwordHash = await bcrypt.hash(input.password, 12);

    const createdUser = await ctx.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: passwordHash,
        phone: input.phone,
        instagram: input.instagram,
        avatarUrl: input.avatarUrl,
        status: UserStatus.Active,
        roleId: advertiserRole.id,
        addressId,
      },
      select: userProfileSelect,
    });

    const tokens = await createSessionTokens(ctx.prisma, {
      userId: createdUser.id,
      role: advertiserRole.name,
    });

    return {
      ...tokens,
      user: serializeUserProfile(createdUser),
    };
  }),

  login: publicProcedure.input(loginInputSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { email: input.email },
      select: {
        ...userProfileSelect,
        password: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais invalidas." });
    }

    const validPassword = await bcrypt.compare(input.password, user.password);
    if (!validPassword) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Credenciais invalidas." });
    }

    if (user.status !== UserStatus.Active) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Conta bloqueada." });
    }

    if (!user.role) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Conta sem permissao configurada.' });
    }

    const tokens = await createSessionTokens(ctx.prisma, {
      userId: user.id,
      role: user.role.name,
    });

    return {
      ...tokens,
      user: serializeUserProfile(user),
    };
  }),

  refresh: publicProcedure.input(refreshInputSchema).mutation(async ({ ctx, input }) => {
    return rotateSessionTokens(ctx.prisma, input.refreshToken);
  }),

  logout: publicProcedure.input(refreshInputSchema).mutation(async ({ ctx, input }) => {
    await revokeSessionToken(ctx.prisma, input.refreshToken);
    return { success: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: userProfileSelect,
    });

    if (!user || user.status !== UserStatus.Active) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuario nao encontrado." });
    }

    if (!user.role) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Conta sem permissao configurada.' });
    }

    return serializeUserProfile(user);
  }),
});

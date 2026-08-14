import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const complaintRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        category: z.string().min(1, "Categoria é obrigatória"),
        reason: z.string().min(1, "Motivo é obrigatório"),
        advertisementId: z.number().optional(),
        targetUserId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.advertisementId && !input.targetUserId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "Você precisa especificar um anúncio ou um usuário para denunciar"
        });
      }

      const complaint = await ctx.prisma.complaint.create({
        data: {
          category: input.category,
          reason: input.reason,
          userId: ctx.user.id,
          advertisementId: input.advertisementId,
          targetUserId: input.targetUserId,
        },
      });

      return complaint;
    }),
});

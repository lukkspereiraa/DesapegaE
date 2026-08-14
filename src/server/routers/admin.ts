import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { serializeUserProfile } from "../serializers";

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.user.id },
    include: { role: true },
  });

  if (user?.role?.name !== "Admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar esta rota" });
  }

  return next({ ctx: { ...ctx, user } });
});

export const adminRouter = router({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const pendingComplaints = await ctx.prisma.complaint.count({
      where: { seen: false },
    });

    const activeAds = await ctx.prisma.advertisement.count({
      where: { status: "Open" },
    });

    const registeredUsers = await ctx.prisma.user.count();

    return {
      pendingComplaints,
      activeAds,
      registeredUsers,
    };
  }),

  listComplaints: adminProcedure
    .input(
      z.object({
        filter: z.enum(["ALL", "FRAUD", "PROHIBITED", "OFFENSIVE"]).default("ALL"),
      })
    )
    .query(async ({ ctx, input }) => {
      const whereClause: any = { seen: false };
      if (input.filter !== "ALL") {
        whereClause.category = input.filter;
      }
      
      const complaints = await ctx.prisma.complaint.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          advertisement: {
            include: { pictures: true }
          },
          targetUser: true,
          user: true, // Quem denunciou
        },
      });

      return complaints.map((c) => {
        let alvoTipo = "Desconhecido";
        let alvoNome = "";
        let alvoImagem = "";
        let alvoId = 0;

        if (c.advertisement) {
          alvoTipo = "Anuncio";
          alvoNome = c.advertisement.title;
          alvoImagem = c.advertisement.pictures[0]?.url || "";
          alvoId = c.advertisement.id;
        } else if (c.targetUser) {
          alvoTipo = "Usuario";
          alvoNome = c.targetUser.name;
          alvoImagem = c.targetUser.avatarUrl || ""; // Could resolve blob, but let's keep it simple for now
          alvoId = c.targetUser.id;
        }

        return {
          id: c.id,
          createdAt: c.createdAt,
          reason: c.reason,
          category: c.category,
          seen: c.seen,
          alvoTipo,
          alvoNome,
          alvoImagem,
          alvoId,
          denuncianteNome: c.user.name,
        };
      });
    }),

  markAsSeen: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.complaint.update({
        where: { id: input.id },
        data: { seen: true },
      });
      return { success: true };
    }),

  removeAd: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Find the complaint
      const complaint = await ctx.prisma.complaint.findUnique({
        where: { id: input.id },
      });

      if (!complaint || !complaint.advertisementId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Denúncia ou anúncio não encontrado" });
      }

      await ctx.prisma.advertisement.delete({
        where: { id: complaint.advertisementId },
      });

      // Mark complaint as seen
      await ctx.prisma.complaint.update({
        where: { id: input.id },
        data: { seen: true },
      });

      return { success: true };
    }),

  banUser: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const complaint = await ctx.prisma.complaint.findUnique({
        where: { id: input.id },
      });

      if (!complaint) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const targetUserId = complaint.targetUserId || complaint.advertisementId; // Wait, if it's an ad, ban the advertiser
      
      let finalUserIdToBan = complaint.targetUserId;
      
      if (!finalUserIdToBan && complaint.advertisementId) {
        const ad = await ctx.prisma.advertisement.findUnique({ where: { id: complaint.advertisementId }});
        finalUserIdToBan = ad?.advertiserId || null;
      }

      if (!finalUserIdToBan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      // Deletar denúncias FEITAS por este usuário
      await ctx.prisma.complaint.deleteMany({
        where: { userId: finalUserIdToBan },
      });

      // Deletar denúncias CONTRA este usuário
      await ctx.prisma.complaint.deleteMany({
        where: { targetUserId: finalUserIdToBan },
      });

      // Deletar todos os anúncios deste usuário
      // Isso cascateia para AdvertisementPictures, Reviews e Complaints contra os anúncios dele
      await ctx.prisma.advertisement.deleteMany({
        where: { advertiserId: finalUserIdToBan },
      });

      // Atualizar o status do usuário para Bloqueado
      await ctx.prisma.user.update({
        where: { id: finalUserIdToBan },
        data: { status: "Blocked" },
      });

      return { success: true };
    }),

  ignoreComplaint: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.complaint.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),

  listUsers: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        role: true,
        _count: {
          select: { advertisements: true, complaintsReceived: true }
        }
      }
    });

    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      status: u.status,
      role: u.role?.name || "Guest",
      createdAt: u.createdAt,
      adsCount: u._count.advertisements,
      complaintsCount: u._count.complaintsReceived
    }));
  }),

  toggleUserStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["Active", "Blocked"]) }))
    .mutation(async ({ ctx, input }) => {
      
      if (input.status === "Blocked") {
        // Deletar denúncias FEITAS por este usuário
        await ctx.prisma.complaint.deleteMany({
          where: { userId: input.id },
        });

        // Deletar denúncias CONTRA este usuário
        await ctx.prisma.complaint.deleteMany({
          where: { targetUserId: input.id },
        });

        // Deletar todos os anúncios deste usuário
        await ctx.prisma.advertisement.deleteMany({
          where: { advertiserId: input.id },
        });
      }

      await ctx.prisma.user.update({
        where: { id: input.id },
        data: { status: input.status },
      });
      return { success: true };
    }),
});

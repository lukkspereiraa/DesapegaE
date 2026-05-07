import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const requireAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Autenticacao obrigatoria." });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(requireAuth);

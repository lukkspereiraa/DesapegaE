import { authRouter } from "./auth";
import { productRouter } from "./product";
import { userRouter } from "./user";
import { router } from "../trpc";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  product: productRouter,
});

export type AppRouter = typeof appRouter;

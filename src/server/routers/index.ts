import { authRouter } from "./auth";
import { productRouter } from "./product";
import { complaintRouter } from "./complaint";
import { adminRouter } from "./admin";
import { userRouter } from "./user";
import { router } from "../trpc";

export const appRouter = router({
  auth: authRouter,
  complaint: complaintRouter,
  admin: adminRouter,
  product: productRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

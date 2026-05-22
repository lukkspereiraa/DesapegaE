import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "../server/routers";
import { getAccessToken } from "./session";

export const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${apiBaseUrl}/trpc`,
      transformer: superjson,
      headers() {
        const token = getAccessToken();
        if (!token) return {};

        return {
          authorization: `Bearer ${token}`,
        };
      },
    }),
  ],
});

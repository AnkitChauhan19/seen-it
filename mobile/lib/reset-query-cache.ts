import { queryClient } from "@/lib/query-client";

/** Clears cached library/watchlist/home data (required on sign-out or user switch). */
export function resetUserScopedQueryCache(): void {
  queryClient.clear();
}

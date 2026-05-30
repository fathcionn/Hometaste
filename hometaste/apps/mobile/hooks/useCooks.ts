import type { CooksResponse, FilterState } from "@hometaste/types";
import { useInfiniteQuery, type InfiniteData, type QueryKey } from "@tanstack/react-query";
import { apiRequest } from "../services/api";

function toParams(filters: FilterState, search: string, page: number): string {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (filters.cuisines.length > 0) params.set("cuisine", filters.cuisines.join(","));
  if (filters.minRating > 0) params.set("minRating", String(filters.minRating));
  if (filters.availableNow) params.set("availableNow", "true");
  if (search.trim()) params.set("search", search.trim());
  return params.toString();
}

export function useCooks(filters: FilterState, search: string) {
  return useInfiniteQuery<CooksResponse, Error, InfiniteData<CooksResponse>, QueryKey, number>({
    queryKey: ["cooks", filters, search],
    queryFn: ({ pageParam = 1 }) => apiRequest<CooksResponse>(`/api/cooks?${toParams(filters, search, pageParam)}`),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    staleTime: 2 * 60 * 1000
  });
}

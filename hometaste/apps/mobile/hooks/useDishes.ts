import type { DishesResponse, FilterState } from "@hometaste/types";
import { useInfiniteQuery, type InfiniteData, type QueryKey } from "@tanstack/react-query";
import { apiRequest } from "../services/api";

function toParams(filters: FilterState, search: string, page: number): string {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (filters.cuisines.length > 0) params.set("cuisine", filters.cuisines.join(","));
  if (filters.minPrice > 0) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice < 200) params.set("maxPrice", String(filters.maxPrice));
  if (filters.minRating > 0) params.set("minRating", String(filters.minRating));
  if (filters.maxPrepTime) params.set("maxPrepTime", String(filters.maxPrepTime));
  if (filters.availableNow) params.set("availableNow", "true");
  if (filters.halalOnly) params.set("halalOnly", "true");
  if (filters.vegan) params.set("vegan", "true");
  if (filters.spicy) params.set("spicy", "true");
  if (search.trim()) params.set("search", search.trim());
  return params.toString();
}

export function useDishes(filters: FilterState, search: string) {
  return useInfiniteQuery<DishesResponse, Error, InfiniteData<DishesResponse>, QueryKey, number>({
    queryKey: ["dishes", filters, search],
    queryFn: ({ pageParam = 1 }) => apiRequest<DishesResponse>(`/api/dishes?${toParams(filters, search, pageParam)}`),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage ?? undefined,
    staleTime: 2 * 60 * 1000
  });
}

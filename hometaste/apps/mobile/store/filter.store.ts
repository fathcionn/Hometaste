import type { FilterState } from "@hometaste/types";
import { create } from "zustand";

export const defaultFilters: FilterState = {
  cuisines: [],
  minPrice: 0,
  maxPrice: 200,
  minRating: 0,
  maxPrepTime: null,
  availableNow: false,
  halalOnly: false,
  vegan: false,
  spicy: false
};

interface FilterStore {
  dishFilters: FilterState;
  cookFilters: FilterState;
  setDishFilters: (filters: Partial<FilterState>) => void;
  setCookFilters: (filters: Partial<FilterState>) => void;
  resetDishFilters: () => void;
  resetCookFilters: () => void;
  getDishFilterCount: () => number;
  getCookFilterCount: () => number;
}

function countFilters(filters: FilterState): number {
  return [
    filters.cuisines.length > 0,
    filters.minPrice > defaultFilters.minPrice || filters.maxPrice < defaultFilters.maxPrice,
    filters.minRating > 0,
    filters.maxPrepTime !== null,
    filters.availableNow,
    filters.halalOnly,
    filters.vegan,
    filters.spicy
  ].filter(Boolean).length;
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  dishFilters: defaultFilters,
  cookFilters: defaultFilters,
  setDishFilters(filters) {
    set((state) => ({ dishFilters: { ...state.dishFilters, ...filters } }));
  },
  setCookFilters(filters) {
    set((state) => ({ cookFilters: { ...state.cookFilters, ...filters } }));
  },
  resetDishFilters() {
    set({ dishFilters: defaultFilters });
  },
  resetCookFilters() {
    set({ cookFilters: defaultFilters });
  },
  getDishFilterCount() {
    return countFilters(get().dishFilters);
  },
  getCookFilterCount() {
    return countFilters(get().cookFilters);
  }
}));

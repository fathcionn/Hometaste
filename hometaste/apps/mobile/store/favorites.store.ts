import { create } from "zustand";

interface FavoritesStore {
  dishIds: string[];
  cookIds: string[];
  isDishFavorited: (dishId: string) => boolean;
  isCookFavorited: (cookId: string) => boolean;
  toggleDish: (dishId: string) => void;
  toggleCook: (cookId: string) => void;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  dishIds: [],
  cookIds: [],
  isDishFavorited(dishId) {
    return get().dishIds.includes(dishId);
  },
  isCookFavorited(cookId) {
    return get().cookIds.includes(cookId);
  },
  toggleDish(dishId) {
    set((state) => ({
      dishIds: state.dishIds.includes(dishId) ? state.dishIds.filter((id) => id !== dishId) : [...state.dishIds, dishId]
    }));
  },
  toggleCook(cookId) {
    set((state) => ({
      cookIds: state.cookIds.includes(cookId) ? state.cookIds.filter((id) => id !== cookId) : [...state.cookIds, cookId]
    }));
  }
}));

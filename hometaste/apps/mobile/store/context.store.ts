import type { UserContext } from "@hometaste/types";
import { create } from "zustand";
import { COUNTRIES } from "../constants/countries";

interface ContextState extends UserContext {
  setCountry: (countryCode: string) => void;
  setCity: (city: string) => void;
  toggleCuisine: (cuisine: string) => void;
}

export const useContextStore = create<ContextState>((set) => ({
  countryCode: null,
  city: null,
  currency: null,
  currencySymbol: null,
  cuisinePrefs: [],
  setCountry(countryCode) {
    const country = COUNTRIES.find((item) => item.code === countryCode) ?? COUNTRIES[0]!;
    set({
      countryCode: country.code,
      currency: country.currency,
      currencySymbol: country.currencySymbol
    });
  },
  setCity(city) {
    set({ city });
  },
  toggleCuisine(cuisine) {
    set((state) => ({
      cuisinePrefs: state.cuisinePrefs.includes(cuisine)
        ? state.cuisinePrefs.filter((item) => item !== cuisine)
        : [...state.cuisinePrefs, cuisine]
    }));
  }
}));

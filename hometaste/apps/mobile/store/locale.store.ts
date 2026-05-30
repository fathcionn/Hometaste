import { bundledTranslations, defaultLocale, getMessage, isRtlLocale, type Locale } from "@hometaste/i18n";
import { I18nManager } from "react-native";
import { create } from "zustand";
import { MMKVStorage } from "../utils/mmkv";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

function interpolate(value: string, params?: Record<string, string | number>): string {
  if (!params) return value;
  return Object.entries(params).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: (MMKVStorage.getItem("locale") as Locale | null) ?? defaultLocale,
  setLocale(locale) {
    I18nManager.allowRTL(isRtlLocale(locale));
    MMKVStorage.setItem("locale", locale);
    set({ locale });
  },
  t(key, params) {
    const locale = get().locale;
    const messages = bundledTranslations[locale] ?? bundledTranslations[defaultLocale];
    return interpolate(getMessage(messages, key), params);
  }
}));

export function useT(): LocaleState["t"] {
  return useLocaleStore((state) => state.t);
}

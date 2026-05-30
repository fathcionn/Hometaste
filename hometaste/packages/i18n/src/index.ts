import ar from "./translations/ar.json" with { type: "json" };
import en from "./translations/en.json" with { type: "json" };
import tr from "./translations/tr.json" with { type: "json" };

export type Locale = "en" | "ar" | "tr" | (string & {});
export type TranslationMessages = typeof en;

export const defaultLocale = "en" satisfies Locale;
export const rtlLocales = ["ar"] as const;
export const bundledTranslations: Record<string, TranslationMessages> = { en, ar, tr };

/**
 * Returns whether a locale should render right-to-left.
 */
export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale as "ar");
}

/**
 * Loads translation messages by locale. Adding a future language only requires
 * adding `src/translations/{locale}.json`; consumers can call this by locale.
 */
export async function loadMessages(locale: Locale): Promise<TranslationMessages> {
  const normalizedLocale = locale.toLowerCase();
  if (normalizedLocale in bundledTranslations) {
    return bundledTranslations[normalizedLocale] ?? en;
  }

  try {
    const messages = await import(`./translations/${normalizedLocale}.json`, {
      with: { type: "json" }
    });
    return (messages.default ?? en) as TranslationMessages;
  } catch {
    return en;
  }
}

/**
 * Reads a dot-separated translation key with English fallback.
 */
export function getMessage(messages: TranslationMessages, key: string): string {
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, messages);

  if (typeof value === "string") return value;

  const fallback = key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, en);

  return typeof fallback === "string" ? fallback : key;
}

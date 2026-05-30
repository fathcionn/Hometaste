import type { CountryConfig } from "@hometaste/types";

export const COUNTRIES: CountryConfig[] = [
  { code: "TR", name: "Turkey", flag: "🇹🇷", currency: "TRY", currencySymbol: "₺", paymentMethods: ["iyzico", "Troy", "Papara", "PayTR", "EFT/Havale", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Cash"] },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR", currencySymbol: "€", paymentMethods: ["SEPA", "Klarna", "PayPal", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Sofort", "Cash"] },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR", currencySymbol: "€", paymentMethods: ["Bizum", "PayPal", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Cash"] },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", currencySymbol: "£", paymentMethods: ["Faster Payments", "PayPal", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Cash"] },
  { code: "EG", name: "Egypt", flag: "🇪🇬", currency: "EGP", currencySymbol: "EGP", paymentMethods: ["Fawry", "Vodafone Cash", "InstaPay", "Visa", "Mastercard", "Cash"] },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", currencySymbol: "SAR", paymentMethods: ["STC Pay", "Mada", "Visa", "Mastercard", "Apple Pay", "Cash"] },
  { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED", currencySymbol: "AED", paymentMethods: ["Apple Pay", "Visa", "Mastercard", "Cash"] },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR", currencySymbol: "€", paymentMethods: ["PayPal", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Cash"] },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", currency: "EUR", currencySymbol: "€", paymentMethods: ["iDEAL", "PayPal", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Cash"] },
  { code: "SE", name: "Sweden", flag: "🇸🇪", currency: "SEK", currencySymbol: "SEK", paymentMethods: ["Swish", "Klarna", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Cash"] },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", currencySymbol: "$", paymentMethods: ["PayPal", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Cash"] },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", currencySymbol: "CA$", paymentMethods: ["Interac", "PayPal", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Cash"] },
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", currencySymbol: "A$", paymentMethods: ["PayPal", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Cash"] },
  { code: "OTHER", name: "Other", flag: "🌍", currency: "USD", currencySymbol: "$", paymentMethods: ["PayPal", "Visa", "Mastercard", "Apple Pay", "Google Pay", "Cash"] }
];

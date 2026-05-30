import type { TextStyle, ViewStyle } from "react-native";

export const Colors = {
  bg: "#101012",
  panel: "#171719",
  panel2: "#202024",
  line: "#303037",
  text: "#f6f2ed",
  muted: "#a9a29a",
  soft: "#71695f",
  brand: "#f97316",
  brand2: "#ffb347",
  success: "#22c55e",
  error: "#ef4444",
  warning: "#facc15"
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
} as const;

export const Radii = {
  sm: 6,
  md: 8,
  lg: 12,
  pill: 999
} as const;

export const Typography = {
  displayLarge: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 32 } satisfies TextStyle,
  displayMedium: { fontFamily: "PlayfairDisplay_700Bold", fontSize: 24 } satisfies TextStyle,
  headingLarge: { fontFamily: "DMSans_600SemiBold", fontSize: 20 } satisfies TextStyle,
  headingMedium: { fontFamily: "DMSans_600SemiBold", fontSize: 16 } satisfies TextStyle,
  body: { fontFamily: "DMSans_400Regular", fontSize: 14 } satisfies TextStyle,
  bodySmall: { fontFamily: "DMSans_400Regular", fontSize: 12 } satisfies TextStyle,
  label: { fontFamily: "DMSans_500Medium", fontSize: 12 } satisfies TextStyle,
  button: { fontFamily: "DMSans_600SemiBold", fontSize: 15 } satisfies TextStyle
} as const;

export const Shadows = {
  panel: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  } satisfies ViewStyle
} as const;

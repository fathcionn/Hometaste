import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";

export interface ButtonProps extends PressableProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ children, variant = "primary", style, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        typeof style === "function" ? style({ pressed }) : style
      ]}
      {...props}
    >
      <Text style={[styles.text, variant === "secondary" ? styles.secondaryText : null]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.lg
  },
  primary: {
    backgroundColor: Colors.brand
  },
  secondary: {
    backgroundColor: Colors.panel2,
    borderColor: Colors.line,
    borderWidth: 1
  },
  ghost: {
    backgroundColor: "transparent"
  },
  disabled: {
    opacity: 0.55
  },
  pressed: {
    opacity: 0.86
  },
  text: {
    ...Typography.button,
    color: Colors.text
  },
  secondaryText: {
    color: Colors.text
  }
});

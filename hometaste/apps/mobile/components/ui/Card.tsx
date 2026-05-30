import type { ReactNode } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { Colors, Radii, Spacing } from "../../constants/theme";

export interface CardProps extends ViewProps {
  children: ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.panel,
    borderColor: Colors.line,
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: Spacing.lg
  }
});

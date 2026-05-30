import { MotiView } from "moti";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../ui";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useT } from "../../store/locale.store";

export interface EmptyStateProps {
  type: "dishes" | "cooks" | "orders" | "messages" | "favorites" | "search";
  onAction?: () => void;
}

function EmptyStateBase({ type, onAction }: EmptyStateProps) {
  const t = useT();
  const titleKey = type === "cooks" ? "empty.cooksTitle" : type === "search" ? "empty.searchTitle" : "empty.dishesTitle";
  const subtitleKey = type === "cooks" ? "empty.cooksSubtitle" : type === "search" ? "empty.searchSubtitle" : "empty.dishesSubtitle";

  return (
    <View style={styles.wrap}>
      <MotiView from={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={styles.illustration}>
        <View style={styles.circle} />
        <View style={styles.line} />
      </MotiView>
      <Text style={styles.title}>{t(titleKey)}</Text>
      <Text style={styles.subtitle}>{t(subtitleKey)}</Text>
      {type === "search" && onAction ? <Button variant="secondary" onPress={onAction}>{t("empty.clearSearch")}</Button> : null}
    </View>
  );
}

export const EmptyState = memo(EmptyStateBase);

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.xl
  },
  illustration: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
    borderColor: Colors.line,
    borderRadius: Radii.lg,
    borderWidth: 1,
    backgroundColor: Colors.panel
  },
  circle: {
    width: 42,
    height: 42,
    borderRadius: Radii.pill,
    backgroundColor: "rgba(249,115,22,0.18)"
  },
  line: {
    width: 52,
    height: 8,
    marginTop: Spacing.sm,
    borderRadius: Radii.pill,
    backgroundColor: Colors.panel2
  },
  title: {
    ...Typography.headingMedium,
    color: Colors.text
  },
  subtitle: {
    ...Typography.body,
    color: Colors.muted,
    textAlign: "center"
  }
});

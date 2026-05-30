import { SlidersHorizontal } from "lucide-react-native";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useT } from "../../store/locale.store";

export interface FilterButtonProps {
  count: number;
  onPress: () => void;
}

function FilterButtonBase({ count, onPress }: FilterButtonProps) {
  const t = useT();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
      <SlidersHorizontal color={Colors.text} size={18} />
      <Text style={styles.text}>{t("browse.filters")}</Text>
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export const FilterButton = memo(FilterButtonBase);

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderColor: Colors.line,
    borderRadius: Radii.pill,
    borderWidth: 1,
    backgroundColor: Colors.panel,
    paddingHorizontal: Spacing.md
  },
  text: {
    ...Typography.label,
    color: Colors.text
  },
  badge: {
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radii.pill,
    backgroundColor: Colors.brand,
    paddingHorizontal: Spacing.xs
  },
  badgeText: {
    ...Typography.label,
    color: Colors.text,
    fontSize: 10
  }
});

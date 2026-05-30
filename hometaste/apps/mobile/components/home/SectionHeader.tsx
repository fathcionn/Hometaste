import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Spacing, Typography } from "../../constants/theme";
import { useT } from "../../store/locale.store";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
}

function SectionHeaderBase({ title, subtitle, onSeeAll }: SectionHeaderProps) {
  const t = useT();
  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onSeeAll ? (
        <Pressable accessibilityRole="button" onPress={onSeeAll}>
          <Text style={styles.seeAll}>{t("home.seeAll")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const SectionHeader = memo(SectionHeaderBase);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md
  },
  title: {
    ...Typography.headingMedium,
    color: Colors.text
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.muted,
    marginTop: 2
  },
  seeAll: {
    ...Typography.label,
    color: Colors.brand2
  }
});

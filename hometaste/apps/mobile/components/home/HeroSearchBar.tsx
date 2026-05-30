import { SlidersHorizontal, Search } from "lucide-react-native";
import { router } from "expo-router";
import { memo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useT } from "../../store/locale.store";

export interface HeroSearchBarProps {
  onFilterPress?: () => void;
}

function HeroSearchBarBase({ onFilterPress }: HeroSearchBarProps) {
  const t = useT();
  const [query, setQuery] = useState("");
  const focused = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${90 + focused.value * 10}%`,
    backgroundColor: interpolateColor(focused.value, [0, 1], [Colors.panel, Colors.panel2])
  }));

  function submit(): void {
    if (query.trim()) router.navigate({ pathname: "/(tabs)/browse", params: { search: query.trim(), tab: "dishes" } });
  }

  return (
    <View style={styles.outer}>
      <Animated.View style={[styles.search, animatedStyle]}>
        <Search color={Colors.muted} size={20} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={submit}
          onFocus={() => { focused.value = withSpring(1); }}
          onBlur={() => { focused.value = withSpring(0); }}
          placeholder={t("hero.searchPlaceholder")}
          placeholderTextColor={Colors.soft}
          returnKeyType="search"
          style={styles.input}
        />
        <Pressable accessibilityRole="button" onPress={onFilterPress} hitSlop={10}>
          <SlidersHorizontal color={Colors.brand2} size={20} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

export const HeroSearchBar = memo(HeroSearchBarBase);

const styles = StyleSheet.create({
  outer: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md
  },
  search: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderColor: Colors.line,
    borderRadius: Radii.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.md
  },
  input: {
    ...Typography.body,
    flex: 1,
    color: Colors.text
  }
});

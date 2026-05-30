import type { Cuisine } from "@hometaste/types";
import { CUISINES } from "@hometaste/types";
import { memo, useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";

export interface CuisineChipsProps {
  selectedCuisine: string | null;
  onSelect: (cuisine: string | null) => void;
}

interface CuisineChipProps {
  cuisine: Cuisine;
  active: boolean;
  onPress: () => void;
}

function CuisineChip({ cuisine, active, onPress }: CuisineChipProps) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPress={() => {
        scale.value = withSpring(0.96, {}, () => { scale.value = withSpring(1); });
        onPress();
      }}
    >
      <Animated.View style={[styles.chip, active ? styles.active : styles.inactive, style]}>
        <Text style={[styles.text, active ? styles.activeText : styles.inactiveText]}>{cuisine.emoji} {cuisine.name}</Text>
      </Animated.View>
    </Pressable>
  );
}

function CuisineChipsBase({ selectedCuisine, onSelect }: CuisineChipsProps) {
  const renderItem = useCallback(({ item }: { item: Cuisine }) => (
    <CuisineChip cuisine={item} active={(selectedCuisine ?? "all") === item.id} onPress={() => onSelect(item.id === "all" ? null : item.id)} />
  ), [onSelect, selectedCuisine]);

  return (
    <FlatList
      data={CUISINES}
      horizontal
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    />
  );
}

export const CuisineChips = memo(CuisineChipsBase);

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm
  },
  chip: {
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
  },
  active: {
    backgroundColor: Colors.brand
  },
  inactive: {
    backgroundColor: Colors.panel2
  },
  text: {
    ...Typography.bodySmall
  },
  activeText: {
    color: Colors.text
  },
  inactiveText: {
    color: Colors.muted
  }
});

import BottomSheet, { BottomSheetBackdrop, BottomSheetView, type BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Slider } from "@miblanchard/react-native-slider";
import { CUISINES, type FilterState } from "@hometaste/types";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { defaultFilters } from "../../store/filter.store";
import { useT } from "../../store/locale.store";
import { Button } from "../ui";

export interface FilterBottomSheetProps {
  open: boolean;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClose: () => void;
}

function FilterBottomSheetBase({ open, filters, onApply, onClose }: FilterBottomSheetProps) {
  const t = useT();
  const [draft, setDraft] = useState(filters);
  const snapPoints = useMemo(() => ["85%"], []);
  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" opacity={0.58} />
  ), []);

  useEffect(() => {
    setDraft(filters);
  }, [filters, open]);

  function toggleCuisine(cuisine: string): void {
    const cuisines = draft.cuisines.includes(cuisine) ? draft.cuisines.filter((item) => item !== cuisine) : [...draft.cuisines, cuisine];
    setDraft({ ...draft, cuisines });
  }

  return (
    <BottomSheet
      index={open ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("browse.filters")}</Text>
          <Pressable onPress={() => setDraft(defaultFilters)}>
            <Text style={styles.reset}>{t("browse.resetFilters")}</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>{t("browse.cuisine")}</Text>
        <View style={styles.wrap}>
          {CUISINES.filter((item) => item.id !== "all").map((cuisine) => (
            <Text key={cuisine.id} onPress={() => toggleCuisine(cuisine.id)} style={[styles.chip, draft.cuisines.includes(cuisine.id) ? styles.chipActive : null]}>
              {cuisine.emoji} {cuisine.name}
            </Text>
          ))}
        </View>

        <Text style={styles.label}>{t("browse.priceRange")}</Text>
        <Slider
          value={[draft.minPrice, draft.maxPrice]}
          minimumValue={0}
          maximumValue={200}
          step={5}
          minimumTrackTintColor={Colors.brand}
          maximumTrackTintColor={Colors.line}
          thumbTintColor={Colors.brand2}
          onValueChange={(value) => {
            const [minPrice = 0, maxPrice = 200] = value as number[];
            setDraft({ ...draft, minPrice, maxPrice });
          }}
        />

        <Text style={styles.label}>{t("browse.minRating")}</Text>
        <View style={styles.wrap}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <Text key={rating} onPress={() => setDraft({ ...draft, minRating: rating })} style={[styles.chip, draft.minRating === rating ? styles.chipActive : null]}>
              ★ {rating}
            </Text>
          ))}
        </View>

        <Text style={styles.label}>{t("browse.maxPrepTime")}</Text>
        <View style={styles.wrap}>
          {[15, 30, 45, 60, 90].map((minutes) => (
            <Text key={minutes} onPress={() => setDraft({ ...draft, maxPrepTime: minutes })} style={[styles.chip, draft.maxPrepTime === minutes ? styles.chipActive : null]}>
              {t("browse.prepTimeMin", { count: minutes })}
            </Text>
          ))}
        </View>

        {(["availableNow", "halalOnly", "vegan", "spicy"] as const).map((key) => (
          <View key={key} style={styles.toggleRow}>
            <Text style={styles.toggleText}>{t(`browse.${key}`)}</Text>
            <Switch value={draft[key]} onValueChange={(value) => setDraft({ ...draft, [key]: value })} trackColor={{ true: Colors.brand, false: Colors.line }} thumbColor={Colors.text} />
          </View>
        ))}

        <Button onPress={() => onApply(draft)}>{t("browse.applyFilters")}</Button>
      </BottomSheetView>
    </BottomSheet>
  );
}

export const FilterBottomSheet = memo(FilterBottomSheetBase);

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: Colors.panel
  },
  handle: {
    backgroundColor: Colors.soft
  },
  content: {
    gap: Spacing.md,
    padding: Spacing.lg
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    ...Typography.headingLarge,
    color: Colors.text
  },
  reset: {
    ...Typography.label,
    color: Colors.brand2
  },
  label: {
    ...Typography.label,
    color: Colors.muted,
    textTransform: "uppercase"
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm
  },
  chip: {
    ...Typography.bodySmall,
    overflow: "hidden",
    borderColor: Colors.line,
    borderRadius: Radii.pill,
    borderWidth: 1,
    color: Colors.muted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
  },
  chipActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brand,
    color: Colors.text
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  toggleText: {
    ...Typography.body,
    color: Colors.text
  }
});

import { useLocalSearchParams, router } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { CookList } from "../../components/browse/CookList";
import { DishList } from "../../components/browse/DishList";
import { FilterBottomSheet } from "../../components/browse/FilterBottomSheet";
import { FilterButton } from "../../components/browse/FilterButton";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useDebounce } from "../../hooks/useDebounce";
import { useFilterStore } from "../../store/filter.store";
import { useT } from "../../store/locale.store";

type BrowseTab = "dishes" | "cooks";

export default function BrowseScreen() {
  const params = useLocalSearchParams<{ tab?: string; search?: string }>();
  const t = useT();
  const [tab, setTab] = useState<BrowseTab>(params.tab === "cooks" ? "cooks" : "dishes");
  const [searchQuery, setSearchQuery] = useState(params.search ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const underlineX = useSharedValue(tab === "dishes" ? 0 : 1);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const dishFilters = useFilterStore((state) => state.dishFilters);
  const cookFilters = useFilterStore((state) => state.cookFilters);
  const setDishFilters = useFilterStore((state) => state.setDishFilters);
  const setCookFilters = useFilterStore((state) => state.setCookFilters);
  const dishFilterCount = useFilterStore((state) => state.getDishFilterCount());
  const cookFilterCount = useFilterStore((state) => state.getCookFilterCount());
  const activeFilters = tab === "dishes" ? dishFilters : cookFilters;
  const activeCount = tab === "dishes" ? dishFilterCount : cookFilterCount;

  useEffect(() => {
    underlineX.value = withSpring(tab === "dishes" ? 0 : 1);
    router.setParams({ tab });
  }, [tab, underlineX]);

  const underlineStyle = useAnimatedStyle(() => ({ transform: [{ translateX: underlineX.value * 120 }] }));

  const applyFilters = useCallback((nextFilters: typeof activeFilters) => {
    if (tab === "dishes") setDishFilters(nextFilters);
    else setCookFilters(nextFilters);
    setFiltersOpen(false);
  }, [setCookFilters, setDishFilters, tab]);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: keyof typeof activeFilters; label: string }> = [];
    if (activeFilters.cuisines.length > 0) chips.push({ key: "cuisines", label: `${t("browse.cuisine")}: ${activeFilters.cuisines.join(", ")}` });
    if (activeFilters.minRating > 0) chips.push({ key: "minRating", label: `★ ${activeFilters.minRating}+` });
    if (activeFilters.maxPrepTime) chips.push({ key: "maxPrepTime", label: t("browse.prepTimeMin", { count: activeFilters.maxPrepTime }) });
    if (activeFilters.availableNow) chips.push({ key: "availableNow", label: t("browse.availableNow") });
    if (activeFilters.halalOnly) chips.push({ key: "halalOnly", label: t("browse.halalOnly") });
    if (activeFilters.vegan) chips.push({ key: "vegan", label: t("browse.vegan") });
    if (activeFilters.spicy) chips.push({ key: "spicy", label: t("browse.spicy") });
    return chips;
  }, [activeFilters, t]);

  function removeFilter(key: keyof typeof activeFilters): void {
    if (key === "cuisines") applyFilters({ ...activeFilters, cuisines: [] });
    else if (key === "maxPrepTime") applyFilters({ ...activeFilters, maxPrepTime: null });
    else if (key === "minRating") applyFilters({ ...activeFilters, minRating: 0 });
    else applyFilters({ ...activeFilters, [key]: false });
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          <Pressable onPress={() => setTab("dishes")} style={styles.tab}><Text style={[styles.tabText, tab === "dishes" ? styles.tabActive : null]}>{t("browse.dishes")}</Text></Pressable>
          <Pressable onPress={() => setTab("cooks")} style={styles.tab}><Text style={[styles.tabText, tab === "cooks" ? styles.tabActive : null]}>{t("browse.cooks")}</Text></Pressable>
          <Animated.View style={[styles.underline, underlineStyle]} />
        </View>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search color={Colors.muted} size={18} />
            <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder={t("home.searchPlaceholder")} placeholderTextColor={Colors.soft} style={styles.input} />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery("")}>
                <X color={Colors.muted} size={18} />
              </Pressable>
            ) : null}
          </View>
          <FilterButton count={activeCount} onPress={() => setFiltersOpen(true)} />
        </View>
        {activeCount > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFilters}>
            {activeFilterChips.map((chip) => (
              <Text key={String(chip.key)} onPress={() => removeFilter(chip.key)} style={styles.activeChip}>{chip.label} ×</Text>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {tab === "dishes" ? (
        <DishList filters={dishFilters} searchQuery={debouncedSearch} onClearSearch={() => setSearchQuery("")} />
      ) : (
        <CookList filters={cookFilters} searchQuery={debouncedSearch} onClearSearch={() => setSearchQuery("")} />
      )}

      <FilterBottomSheet open={filtersOpen} filters={activeFilters} onApply={applyFilters} onClose={() => setFiltersOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg
  },
  header: {
    gap: Spacing.md,
    borderBottomColor: Colors.line,
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 64,
    paddingBottom: Spacing.md
  },
  tabs: {
    width: 240,
    flexDirection: "row",
    position: "relative"
  },
  tab: {
    width: 120,
    paddingVertical: Spacing.sm
  },
  tabText: {
    ...Typography.headingMedium,
    color: Colors.muted,
    textAlign: "center"
  },
  tabActive: {
    color: Colors.text
  },
  underline: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 120,
    height: 3,
    borderRadius: Radii.pill,
    backgroundColor: Colors.brand
  },
  searchRow: {
    flexDirection: "row",
    gap: Spacing.sm
  },
  searchBox: {
    minHeight: 44,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderColor: Colors.line,
    borderRadius: Radii.pill,
    borderWidth: 1,
    backgroundColor: Colors.panel,
    paddingHorizontal: Spacing.md
  },
  input: {
    ...Typography.body,
    flex: 1,
    color: Colors.text
  },
  activeFilters: {
    gap: Spacing.sm
  },
  activeChip: {
    ...Typography.bodySmall,
    overflow: "hidden",
    borderRadius: Radii.pill,
    backgroundColor: Colors.panel2,
    color: Colors.brand2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
  }
});

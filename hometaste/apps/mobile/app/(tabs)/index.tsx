import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Headphones } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, StyleSheet, View } from "react-native";
import Animated, { interpolateColor, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { CartButton } from "../../components/common/CartButton";
import { FeaturedCooksCarousel } from "../../components/home/FeaturedCooksCarousel";
import { CuisineChips } from "../../components/home/CuisineChips";
import { HeroSearchBar } from "../../components/home/HeroSearchBar";
import { LocationChip } from "../../components/home/LocationChip";
import { NotificationBell } from "../../components/home/NotificationBell";
import { PopularDishesGrid } from "../../components/home/PopularDishesGrid";
import { RecentlyViewedRow } from "../../components/home/RecentlyViewedRow";
import { SectionHeader } from "../../components/home/SectionHeader";
import { Colors, Spacing } from "../../constants/theme";
import { useT } from "../../store/locale.store";

type Section =
  | { type: "featured_cooks" }
  | { type: "popular_dishes" }
  | { type: "recently_viewed" }
  | { type: "nearby_cooks" };

const sections: Section[] = [
  { type: "featured_cooks" },
  { type: "popular_dishes" },
  { type: "recently_viewed" }
];

export default function HomeScreen() {
  const t = useT();
  const queryClient = useQueryClient();
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [isRefreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    }
  });
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(scrollY.value, [0, 80], ["transparent", Colors.bg]),
    borderBottomColor: interpolateColor(scrollY.value, [0, 80], ["transparent", Colors.line])
  }));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["cooks"] });
    await queryClient.invalidateQueries({ queryKey: ["dishes"] });
    setRefreshing(false);
  }, [queryClient]);

  const renderSection = useCallback(({ item }: { item: Section }) => {
    switch (item.type) {
      case "featured_cooks":
        return (
          <>
            <SectionHeader title={t("home.featuredCooks")} onSeeAll={() => router.navigate({ pathname: "/(tabs)/browse", params: { tab: "cooks" } })} />
            <FeaturedCooksCarousel />
          </>
        );
      case "popular_dishes":
        return (
          <>
            <SectionHeader title={t("home.popularDishes")} onSeeAll={() => router.navigate({ pathname: "/(tabs)/browse", params: { tab: "dishes" } })} />
            <PopularDishesGrid selectedCuisine={selectedCuisine} />
          </>
        );
      case "recently_viewed":
        return (
          <>
            <SectionHeader title={t("home.recentlyViewed")} />
            <RecentlyViewedRow />
          </>
        );
      case "nearby_cooks":
        return null;
    }
  }, [selectedCuisine, t]);

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <LocationChip />
        <View style={styles.headerActions}>
          <NotificationBell />
          <CartButton />
        </View>
      </Animated.View>
      <Animated.FlatList
        data={sections}
        keyExtractor={(item) => item.type}
        renderItem={renderSection}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        ListHeaderComponent={<><View style={styles.topSpacer} /><HeroSearchBar /><CuisineChips selectedCuisine={selectedCuisine} onSelect={setSelectedCuisine} /></>}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={Colors.brand} />}
        contentContainerStyle={styles.content}
      />
      <Pressable accessibilityRole="button" style={styles.floatingSupportBtn} onPress={() => router.push("/support/chat")}>
        <Headphones size={22} color={Colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    minHeight: 92,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm
  },
  topSpacer: {
    height: 96
  },
  content: {
    paddingBottom: 112
  },
  floatingSupportBtn: {
    position: "absolute",
    right: Spacing.lg,
    bottom: 96,
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 27,
    backgroundColor: Colors.brand
  }
});

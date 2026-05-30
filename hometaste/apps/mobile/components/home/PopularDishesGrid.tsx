import type { Dish } from "@hometaste/types";
import { memo, useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useDishes } from "../../hooks/useDishes";
import { defaultFilters } from "../../store/filter.store";
import { DishCard, DISH_CARD_HEIGHT, DISH_CARD_WIDTH } from "../dish/DishCard";
import { DishGridSkeleton } from "../common/Skeleton";
import { EmptyState } from "../common/EmptyState";
import { Spacing } from "../../constants/theme";

export interface PopularDishesGridProps {
  selectedCuisine?: string | null;
}

function PopularDishesGridBase({ selectedCuisine }: PopularDishesGridProps) {
  const filters = useMemo(() => ({ ...defaultFilters, cuisines: selectedCuisine ? [selectedCuisine] : [] }), [selectedCuisine]);
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useDishes(filters, "");
  const dishes = useMemo(() => data?.pages.flatMap((page) => page.dishes) ?? [], [data]);
  const renderItem = useCallback(({ item }: { item: Dish }) => <View style={styles.item}><DishCard dish={item} /></View>, []);

  if (isLoading) return <DishGridSkeleton />;

  return (
    <FlatList
      data={dishes}
      numColumns={2}
      scrollEnabled={false}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      getItemLayout={(_, index) => ({ length: DISH_CARD_HEIGHT, offset: DISH_CARD_HEIGHT * Math.floor(index / 2), index })}
      ListEmptyComponent={<EmptyState type="dishes" />}
      ListFooterComponent={isFetchingNextPage ? <DishGridSkeleton /> : null}
      onEndReached={() => { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }}
      onEndReachedThreshold={0.3}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
    />
  );
}

export const PopularDishesGrid = memo(PopularDishesGridBase);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md
  },
  row: {
    gap: Spacing.md,
    marginBottom: Spacing.md
  },
  item: {
    width: DISH_CARD_WIDTH
  }
});

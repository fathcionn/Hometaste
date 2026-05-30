import type { Dish, FilterState } from "@hometaste/types";
import { memo, useCallback, useMemo } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { Colors, Spacing } from "../../constants/theme";
import { useDishes } from "../../hooks/useDishes";
import { DishCard, DISH_CARD_HEIGHT, DISH_CARD_WIDTH } from "../dish/DishCard";
import { EmptyState } from "../common/EmptyState";
import { DishGridSkeleton } from "../common/Skeleton";

export interface DishListProps {
  filters: FilterState;
  searchQuery: string;
  onClearSearch: () => void;
}

function DishListBase({ filters, searchQuery, onClearSearch }: DishListProps) {
  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = useDishes(filters, searchQuery);
  const dishes = useMemo(() => data?.pages.flatMap((page) => page.dishes) ?? [], [data]);
  const renderItem = useCallback(({ item }: { item: Dish }) => <View style={styles.item}><DishCard dish={item} /></View>, []);

  return (
    <FlatList
      data={dishes}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      getItemLayout={(_, index) => ({ length: DISH_CARD_HEIGHT, offset: DISH_CARD_HEIGHT * Math.floor(index / 2), index })}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={5}
      removeClippedSubviews
      onEndReached={() => { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }}
      onEndReachedThreshold={0.3}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={Colors.brand} /> : null}
      ListEmptyComponent={isLoading || isFetching ? <DishGridSkeleton /> : <EmptyState type={searchQuery ? "search" : "dishes"} onAction={onClearSearch} />}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
    />
  );
}

export const DishList = memo(DishListBase);

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    paddingBottom: 120
  },
  row: {
    gap: Spacing.md,
    marginBottom: Spacing.md
  },
  item: {
    width: DISH_CARD_WIDTH
  }
});

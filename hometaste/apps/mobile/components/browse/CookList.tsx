import type { Cook, FilterState } from "@hometaste/types";
import { memo, useCallback, useMemo } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { Colors, Spacing } from "../../constants/theme";
import { useCooks } from "../../hooks/useCooks";
import { CookCard } from "../cook/CookCard";
import { EmptyState } from "../common/EmptyState";
import { CookListSkeleton } from "../common/Skeleton";

export interface CookListProps {
  filters: FilterState;
  searchQuery: string;
  onClearSearch: () => void;
}

function CookListBase({ filters, searchQuery, onClearSearch }: CookListProps) {
  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } = useCooks(filters, searchQuery);
  const cooks = useMemo(() => data?.pages.flatMap((page) => page.cooks) ?? [], [data]);
  const renderItem = useCallback(({ item }: { item: Cook }) => <CookCard cook={item} variant="list" />, []);

  return (
    <FlatList
      data={cooks}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      getItemLayout={(_, index) => ({ length: 132, offset: 132 * index, index })}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={5}
      removeClippedSubviews
      ItemSeparatorComponent={Separator}
      onEndReached={() => { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }}
      onEndReachedThreshold={0.3}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={Colors.brand} /> : null}
      ListEmptyComponent={isLoading || isFetching ? <CookListSkeleton /> : <EmptyState type={searchQuery ? "search" : "cooks"} onAction={onClearSearch} />}
      contentContainerStyle={styles.content}
    />
  );
}

function Separator() {
  return <View style={{ height: Spacing.md }} />;
}

export const CookList = memo(CookListBase);

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    paddingBottom: 120
  }
});

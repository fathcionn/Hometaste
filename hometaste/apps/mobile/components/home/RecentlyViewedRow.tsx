import { memo, useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Spacing, Colors, Typography } from "../../constants/theme";
import { useRecentlyViewedStore, type RecentlyViewedItem } from "../../store/recently-viewed.store";

function RecentlyViewedRowBase() {
  const items = useRecentlyViewedStore((state) => state.items);
  const renderItem = useCallback(({ item }: { item: RecentlyViewedItem }) => (
    <View style={styles.card}>
      <View style={styles.image} />
      <Text style={styles.text} numberOfLines={1}>{item.type} #{item.id.slice(0, 6)}</Text>
    </View>
  ), []);

  if (items.length === 0) return null;

  return (
    <FlatList
      data={items}
      horizontal
      keyExtractor={(item) => `${item.type}-${item.id}`}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    />
  );
}

export const RecentlyViewedRow = memo(RecentlyViewedRowBase);

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg
  },
  card: {
    width: 120
  },
  image: {
    width: 120,
    height: 90,
    borderRadius: 10,
    backgroundColor: Colors.panel2
  },
  text: {
    ...Typography.bodySmall,
    color: Colors.muted,
    marginTop: Spacing.xs
  }
});

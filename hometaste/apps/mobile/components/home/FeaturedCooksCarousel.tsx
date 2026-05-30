import type { Cook, CooksResponse } from "@hometaste/types";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { apiRequest } from "../../services/api";
import { Colors, Spacing, Typography } from "../../constants/theme";
import { CookCard } from "../cook/CookCard";
import { SkeletonBox } from "../common/Skeleton";
import { useT } from "../../store/locale.store";

const CARD_WIDTH = 280;
const GAP = Spacing.md;

function FeaturedCooksCarouselBase() {
  const t = useT();
  const { data, isLoading } = useQuery<CooksResponse, Error>({
    queryKey: ["cooks", "featured"],
    queryFn: () => apiRequest<CooksResponse>("/api/cooks?featured=true&limit=10")
  });
  const cooks = data?.cooks ?? [];
  const renderItem = useCallback(({ item }: { item: Cook }) => <CookCard cook={item} variant="featured" />, []);

  if (isLoading) {
    return (
      <View style={styles.skeletonRow}>
        <SkeletonBox width={CARD_WIDTH} height={180} radius={12} />
        <SkeletonBox width={CARD_WIDTH} height={180} radius={12} />
      </View>
    );
  }

  if (cooks.length === 0) return <Text style={styles.empty}>{t("empty.cooksTitle")}</Text>;

  return (
    <FlatList
      data={cooks}
      horizontal
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      snapToInterval={CARD_WIDTH + GAP}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={Separator}
    />
  );
}

function Separator() {
  return <View style={{ width: GAP }} />;
}

export const FeaturedCooksCarousel = memo(FeaturedCooksCarouselBase);

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing.lg
  },
  skeletonRow: {
    flexDirection: "row",
    gap: GAP,
    paddingHorizontal: Spacing.lg
  },
  empty: {
    ...Typography.body,
    color: Colors.muted,
    paddingHorizontal: Spacing.lg
  }
});

import { Skeleton as MotiSkeleton } from "moti/skeleton";
import { StyleSheet, View } from "react-native";
import { Spacing } from "../../constants/theme";

export interface SkeletonBoxProps {
  width: number;
  height: number;
  radius?: number | "round";
}

export function SkeletonBox({ width, height, radius = 8 }: SkeletonBoxProps) {
  return <MotiSkeleton colorMode="dark" width={width} height={height} radius={radius} />;
}

export function DishCardSkeleton() {
  return <SkeletonBox width={160} height={220} radius={12} />;
}

export function CookCardSkeleton() {
  return <SkeletonBox width={320} height={96} radius={12} />;
}

export function DishGridSkeleton() {
  return (
    <View style={styles.grid}>
      {[0, 1, 2, 3].map((item) => (
        <View key={item} style={styles.gridItem}>
          <DishCardSkeleton />
        </View>
      ))}
    </View>
  );
}

export function CookListSkeleton() {
  return (
    <View style={styles.stack}>
      {[0, 1, 2].map((item) => (
        <CookCardSkeleton key={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg
  },
  gridItem: {
    flex: 1,
    minWidth: "45%"
  },
  stack: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg
  }
});

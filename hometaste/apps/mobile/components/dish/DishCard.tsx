import type { Dish } from "@hometaste/types";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { memo } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useContextStore } from "../../store/context.store";
import { useT } from "../../store/locale.store";
import { FavoriteButton } from "../common/FavoriteButton";

const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = Math.floor(screenWidth / 2 - 24);
const blurhash = "L25|_:V@0gRj0fRj?bof00%MRjWB";

export interface DishCardProps {
  dish: Dish;
  size?: "small" | "medium" | "large";
  onPress?: () => void;
  showCookInfo?: boolean;
}

function DishCardBase({ dish, size = "medium", onPress, showCookInfo = true }: DishCardProps) {
  const t = useT();
  const currencySymbol = useContextStore((state) => state.currencySymbol ?? "$");
  const width = size === "small" ? 120 : size === "large" ? "100%" : CARD_WIDTH;
  const height = size === "small" ? 90 : 220;

  function press(): void {
    if (onPress) onPress();
    else router.push(`/dish/${dish.id}`);
  }

  return (
    <Pressable accessibilityRole="button" onPress={press} style={[styles.card, { width, height }]}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={StyleSheet.absoluteFill}>
        <Image
          source={dish.imageUrl ? { uri: dish.imageUrl } : undefined}
          contentFit="cover"
          transition={200}
          placeholder={blurhash}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <LinearGradient colors={["transparent", "rgba(0,0,0,0.82)"]} style={styles.gradient} />
      <View style={styles.favorite}>
        <FavoriteButton dishId={dish.id} />
      </View>
      {dish.imageVerified ? (
        <View style={styles.verified}>
          <Text style={styles.verifiedText}>📸 {t("cook.verified")}</Text>
        </View>
      ) : null}
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.name}>{dish.name}</Text>
        <Text style={styles.price}>{currencySymbol}{dish.basePrice.toFixed(2)}</Text>
        {showCookInfo ? (
          <Text numberOfLines={1} style={styles.cook}>{dish.cook?.user?.name ?? "Home cook"} · {dish.cook?.originCountry ?? dish.cuisine}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function areEqual(previous: DishCardProps, next: DishCardProps): boolean {
  return previous.dish.id === next.dish.id
    && previous.dish.imageVerified === next.dish.imageVerified
    && previous.dish.basePrice === next.dish.basePrice
    && previous.size === next.size
    && previous.showCookInfo === next.showCookInfo;
}

export const DishCard = memo(DishCardBase, areEqual);
export const DISH_CARD_HEIGHT = 232;
export const DISH_CARD_WIDTH = CARD_WIDTH;

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: Radii.lg,
    backgroundColor: Colors.panel2
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "62%"
  },
  favorite: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm
  },
  verified: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    borderRadius: Radii.pill,
    backgroundColor: "rgba(34,197,94,0.95)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs
  },
  verifiedText: {
    ...Typography.label,
    color: Colors.text,
    fontSize: 10
  },
  content: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.md,
    gap: 2
  },
  name: {
    ...Typography.headingMedium,
    color: Colors.text
  },
  price: {
    ...Typography.button,
    color: Colors.brand2
  },
  cook: {
    ...Typography.bodySmall,
    color: Colors.muted
  }
});

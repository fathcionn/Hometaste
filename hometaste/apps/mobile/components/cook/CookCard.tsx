import type { Cook } from "@hometaste/types";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useT } from "../../store/locale.store";
import { FavoriteButton } from "../common/FavoriteButton";
import { Button } from "../ui";

export interface CookCardProps {
  cook: Cook;
  variant?: "featured" | "list" | "compact";
  onPress?: () => void;
}

function CookCardBase({ cook, variant = "list", onPress }: CookCardProps) {
  const t = useT();
  const user = cook.user;
  const topDish = "dishes" in cook && Array.isArray(cook.dishes) ? cook.dishes[0]?.name : undefined;

  function press(): void {
    if (onPress) onPress();
    else router.push(`/cook/${cook.id}`);
  }

  if (variant === "featured") {
    return (
      <Pressable accessibilityRole="button" onPress={press} style={styles.featured}>
        <Animated.View entering={FadeIn.duration(350)} style={StyleSheet.absoluteFill}>
          <Image source={user?.avatarUrl ? { uri: user.avatarUrl } : undefined} style={StyleSheet.absoluteFill} contentFit="cover" />
        </Animated.View>
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.86)"]} style={styles.featuredGradient} />
        {cook.isVerified ? <Text style={styles.verified}>✓ {t("cook.verified")}</Text> : null}
        <View style={styles.favorite}><FavoriteButton cookId={cook.id} size={16} /></View>
        <View style={styles.featuredContent}>
          <View style={styles.avatarRow}>
            <Animated.View entering={ZoomIn.duration(250).springify()} exiting={FadeOut.duration(150)}>
              <Image source={user?.avatarUrl ? { uri: user.avatarUrl } : undefined} style={styles.avatarSmall} contentFit="cover" />
            </Animated.View>
            <View>
              <Text style={styles.featuredName}>{user?.name ?? "Home cook"} · {cook.originCountry}</Text>
              <Text style={styles.muted}>{cook.currentCity}</Text>
            </View>
          </View>
          <Text style={styles.muted}>★ {cook.avgRatingOverall.toFixed(1)} · {cook.totalOrders} {t("cook.orders")}</Text>
          {topDish ? <Text style={styles.topDish} numberOfLines={1}>{topDish}</Text> : null}
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable accessibilityRole="button" onPress={press} style={[styles.listCard, variant === "compact" ? styles.compact : null]}>
      <Animated.View entering={ZoomIn.duration(250).springify()} exiting={FadeOut.duration(150)}>
        <Image source={user?.avatarUrl ? { uri: user.avatarUrl } : undefined} style={styles.avatar} contentFit="cover" />
      </Animated.View>
      <View style={styles.listContent}>
        <View style={styles.rowBetween}>
          <Text style={styles.name} numberOfLines={1}>{user?.name ?? "Home cook"} · {cook.originCountry}</Text>
          {cook.isVerified ? <Text style={styles.verifiedInline}>✓</Text> : null}
        </View>
        <Text style={styles.muted} numberOfLines={1}>{cook.currentCity} · {cook.cuisines.join(", ")}</Text>
        <Text style={styles.muted}>★ {cook.avgRatingOverall.toFixed(1)} · {cook.totalOrders} {t("cook.orders")}</Text>
        <Text style={cook.isActive ? styles.available : styles.muted}>{cook.isActive ? t("browse.availableNow") : t("chat.offline")}</Text>
        <Text style={styles.muted}>{cook.prepTime ?? "~45 min"} · {cook.availability ?? t("cook.availability")}</Text>
        {topDish ? <Text style={styles.topDish} numberOfLines={1}>{topDish}</Text> : null}
        {variant === "list" ? <Button variant="ghost" onPress={press}>{t("btn.viewProfile")}</Button> : null}
      </View>
    </Pressable>
  );
}

export const CookCard = memo(CookCardBase, (previous, next) => previous.cook.id === next.cook.id && previous.variant === next.variant);

const styles = StyleSheet.create({
  featured: {
    width: 280,
    height: 180,
    overflow: "hidden",
    borderRadius: Radii.lg,
    backgroundColor: Colors.panel2
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject
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
    overflow: "hidden",
    borderRadius: Radii.pill,
    backgroundColor: "rgba(34,197,94,0.92)",
    color: Colors.text,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs
  },
  featuredContent: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.md,
    gap: Spacing.xs
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.panel
  },
  featuredName: {
    ...Typography.headingMedium,
    color: Colors.text
  },
  listCard: {
    flexDirection: "row",
    gap: Spacing.md,
    borderColor: Colors.line,
    borderRadius: Radii.lg,
    borderWidth: 1,
    backgroundColor: Colors.panel,
    padding: Spacing.md
  },
  compact: {
    padding: Spacing.sm
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.panel2
  },
  listContent: {
    flex: 1,
    gap: 3
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm
  },
  name: {
    ...Typography.headingMedium,
    flex: 1,
    color: Colors.text
  },
  muted: {
    ...Typography.bodySmall,
    color: Colors.muted
  },
  available: {
    ...Typography.bodySmall,
    color: Colors.success
  },
  topDish: {
    ...Typography.bodySmall,
    color: Colors.brand2,
    fontStyle: "italic"
  },
  verifiedInline: {
    color: Colors.success
  }
});

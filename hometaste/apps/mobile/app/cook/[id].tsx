import type { Cook, Dish, Review } from "@hometaste/types";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Clock, MessageCircle, ShoppingBag, Star } from "lucide-react-native";
import { MotiView } from "moti";
import type { ReactNode } from "react";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { DishCard } from "../../components/dish/DishCard";
import { apiRequest } from "../../services/api";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import { useT } from "../../store/locale.store";
import { Button } from "../../components/ui";
import { SkeletonBox } from "../../components/common/Skeleton";

type CookDetail = Cook & { dishes: Dish[]; reviews: Review[] };

export default function CookProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useRecentlyViewed(id ?? "", "cook");
  const t = useT();
  const [bioOpen, setBioOpen] = useState(false);
  const { data: cook, isLoading } = useQuery<CookDetail, Error>({
    queryKey: ["cook", id],
    queryFn: () => apiRequest<CookDetail>(`/api/cooks/${id}`),
    enabled: Boolean(id)
  });

  if (isLoading || !cook) return <View style={styles.screen}><SkeletonBox width={360} height={600} /></View>;
  const gallery = cook.dishes.filter((dish) => dish.imageUrl).slice(0, 9);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.coverWrap}>
          <Animated.View entering={FadeIn.duration(350)} style={styles.cover}>
            <Image source={cook.user?.avatarUrl ? { uri: cook.user.avatarUrl } : undefined} style={styles.coverImage} contentFit="cover" />
          </Animated.View>
          <Pressable onPress={() => router.back()} style={styles.back}><ChevronLeft color={Colors.text} size={22} /></Pressable>
          <Animated.View entering={ZoomIn.duration(250).springify()} exiting={FadeOut.duration(150)} style={styles.avatar}>
            <Image source={cook.user?.avatarUrl ? { uri: cook.user.avatarUrl } : undefined} style={StyleSheet.absoluteFill} contentFit="cover" />
          </Animated.View>
          {cook.isVerified ? <Text style={styles.avatarBadge}>✓</Text> : null}
        </View>
        <View style={styles.profileBody}>
          <Text style={styles.name}>{cook.user?.name ?? "Home cook"} · {cook.originCountry}</Text>
          {cook.repeatCustomerRate > 30 ? <Text style={styles.repeat}>⭐ {cook.repeatCustomerRate}% repeat customers</Text> : null}
          <View style={styles.stats}>
            <Stat icon={<ShoppingBag color={Colors.brand2} size={18} />} value={String(cook.totalOrders)} label={t("cook.orders")} />
            <Stat icon={<Star color={Colors.brand2} size={18} />} value={cook.avgRatingOverall.toFixed(1)} label={t("cook.rating")} />
            <Stat icon={<Clock color={Colors.brand2} size={18} />} value={cook.prepTime ?? "~45"} label={t("cook.prepTime")} />
            <Stat icon={<MessageCircle color={Colors.brand2} size={18} />} value="~10m" label={t("cook.responseTime")} />
          </View>
          {cook.bio ? <Text numberOfLines={bioOpen ? undefined : 3} onPress={() => setBioOpen((value) => !value)} style={styles.bio}>{cook.bio}</Text> : null}
          <Text style={styles.sectionTitle}>{t("cook.availability")}</Text>
          <Text style={styles.muted}>{cook.availability ?? "Mon-Sat, 12pm-8pm"}</Text>
          <View style={styles.wrap}>{cook.specialties.map((specialty) => <Text key={specialty} style={styles.chip}>{specialty}</Text>)}</View>
          <Text style={styles.sectionTitle}>{t("rating.food")}</Text>
          <View style={styles.ratingGrid}>
            <RatingBar label={t("rating.food")} value={cook.avgRatingFood} />
            <RatingBar label={t("rating.speed")} value={cook.avgRatingSpeed} />
            <RatingBar label={t("rating.packaging")} value={cook.avgRatingPackaging} />
            <RatingBar label={t("rating.communication")} value={cook.avgRatingComm} />
          </View>
          <Text style={styles.sectionTitle}>{t("cook.gallery")}</Text>
          <View style={styles.gallery}>{gallery.map((dish, index) => <Image key={dish.id} source={{ uri: dish.imageUrl! }} style={[styles.galleryImage, index % 2 ? styles.galleryTall : null]} />)}</View>
          <Text style={styles.sectionTitle}>{t("cook.menu")} ({cook.dishes.length})</Text>
          <FlatList data={cook.dishes} horizontal keyExtractor={(dish) => dish.id} renderItem={({ item }) => <DishCard dish={item} />} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menu} />
          <Text style={styles.sectionTitle}>{t("cook.reviews")} ({cook.reviews.length})</Text>
          {cook.reviews.slice(0, 5).map((review) => <Text key={review.id} style={styles.review}>★ {review.ratingOverall} · {review.comment ?? "Great food"}</Text>)}
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <Button variant="secondary" onPress={() => router.navigate("/(tabs)/messages")}>Message</Button>
        <Button onPress={() => router.navigate({ pathname: "/(tabs)/browse", params: { tab: "dishes" } })}>Order Now</Button>
      </View>
    </View>
  );
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return <View style={styles.stat}>{icon}<Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, (value / 5) * 100);
  return <View style={styles.ratingBar}><Text style={styles.muted}>{label}</Text><View style={styles.bar}><MotiView from={{ width: "0%" }} animate={{ width: `${pct}%` }} style={styles.barFill} /></View><Text style={styles.muted}>{value.toFixed(1)} ⭐</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: 120 },
  coverWrap: { height: 270 },
  cover: { width: "100%", height: 220, overflow: "hidden", backgroundColor: Colors.panel2 },
  coverImage: { width: "100%", height: "100%" },
  back: { position: "absolute", top: 48, left: Spacing.lg, width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: Radii.pill, backgroundColor: "rgba(0,0,0,0.35)" },
  avatar: { position: "absolute", left: Spacing.lg, bottom: 10, width: 80, height: 80, borderColor: Colors.text, borderRadius: 40, borderWidth: 3, backgroundColor: Colors.panel },
  avatarBadge: { position: "absolute", left: 78, bottom: 14, overflow: "hidden", borderRadius: Radii.pill, backgroundColor: Colors.success, color: Colors.text, paddingHorizontal: 7 },
  profileBody: { gap: Spacing.lg, padding: Spacing.lg },
  name: { ...Typography.displayMedium, color: Colors.text },
  repeat: { ...Typography.label, alignSelf: "flex-start", overflow: "hidden", borderRadius: Radii.pill, backgroundColor: Colors.panel2, color: Colors.brand2, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  stats: { flexDirection: "row", gap: Spacing.sm },
  stat: { flex: 1, alignItems: "center", gap: 2, borderColor: Colors.line, borderRadius: Radii.md, borderWidth: 1, padding: Spacing.sm },
  statValue: { ...Typography.headingMedium, color: Colors.text },
  statLabel: { ...Typography.bodySmall, color: Colors.muted, textAlign: "center" },
  bio: { ...Typography.body, color: Colors.muted, lineHeight: 20 },
  sectionTitle: { ...Typography.headingMedium, color: Colors.text },
  muted: { ...Typography.bodySmall, color: Colors.muted },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: { ...Typography.bodySmall, overflow: "hidden", borderRadius: Radii.pill, backgroundColor: Colors.panel2, color: Colors.muted, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  ratingGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  ratingBar: { width: "47%", gap: Spacing.xs },
  bar: { height: 8, overflow: "hidden", borderRadius: Radii.pill, backgroundColor: Colors.line },
  barFill: { height: 8, borderRadius: Radii.pill, backgroundColor: Colors.brand },
  gallery: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  galleryImage: { width: "48%", height: 130, borderRadius: Radii.md, backgroundColor: Colors.panel2 },
  galleryTall: { height: 170 },
  menu: { gap: Spacing.md },
  review: { ...Typography.body, borderBottomColor: Colors.line, borderBottomWidth: 1, color: Colors.muted, paddingVertical: Spacing.sm },
  bottomBar: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", gap: Spacing.md, borderTopColor: Colors.line, borderTopWidth: 1, backgroundColor: Colors.panel, padding: Spacing.lg, paddingBottom: 28 }
});

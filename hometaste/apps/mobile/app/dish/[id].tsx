import type { Dish, Extra, SpiceLevel } from "@hometaste/types";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";
import { CartBottomSheet } from "../../components/cart/CartBottomSheet";
import { SkeletonBox } from "../../components/common/Skeleton";
import { apiRequest } from "../../services/api";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import { useCartStore } from "../../store/cart.store";
import { useContextStore } from "../../store/context.store";
import { useT } from "../../store/locale.store";

export default function DishDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useRecentlyViewed(id ?? "", "dish");
  const t = useT();
  const { data: dish, isLoading } = useQuery<Dish, Error>({
    queryKey: ["dish", id],
    queryFn: () => apiRequest<Dish>(`/api/dishes/${id}`),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000
  });
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [ingredientsOpen, setIngredientsOpen] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const currencySymbol = useContextStore((state) => state.currencySymbol ?? "$");
  const cartCookId = useCartStore((state) => state.cookId);
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const scale = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const total = useMemo(() => {
    if (!dish) return 0;
    return (dish.basePrice + selectedExtras.reduce((sum, extra) => sum + extra.price, 0)) * quantity;
  }, [dish, quantity, selectedExtras]);

  if (isLoading || !dish) return <DishSkeleton />;
  const loadedDish = dish;

  function toggleExtra(extra: Extra): void {
    setSelectedExtras((current) => current.some((item) => item.id === extra.id) ? current.filter((item) => item.id !== extra.id) : [...current, extra]);
  }

  function addToCart(openCart: boolean): void {
    const cook = loadedDish.cook;
    if (!cook) return;
    const currentCookName = useCartStore.getState().items[0]?.cookName ?? "another cook";
    const nextCookName = cook.user?.name ?? "this cook";
    const doAdd = async () => {
      setAdding(true);
      scale.value = withSequence(withSpring(0.96), withSpring(1));
      addItem({
        dishId: loadedDish.id,
        dishName: loadedDish.name,
        imageUrl: loadedDish.imageUrl ?? null,
        cookId: cook.id,
        cookName: nextCookName,
        quantity,
        unitPrice: loadedDish.basePrice,
        extras: selectedExtras.map((extra) => ({ id: extra.id, name: extra.name, price: extra.price })),
        note: instructions
      });
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setAdding(false);
      if (openCart) setCartOpen(true);
    };
    if (cartCookId && cartCookId !== cook.id) {
      Alert.alert(
        "Start a new cart?",
        `Your cart has items from ${currentCookName}. Start a new cart for ${nextCookName}?`,
        [
          { text: "Keep current cart", style: "cancel" },
          { text: "Start new cart", style: "destructive", onPress: () => { clearCart(); void doAdd(); } }
        ]
      );
      return;
    }
    void doAdd();
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" translucent />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeIn.duration(300).delay(50)} style={styles.hero}>
          <Image source={dish.imageUrl ? { uri: dish.imageUrl } : undefined} style={styles.heroImage} contentFit="cover" />
          <LinearGradient colors={["transparent", Colors.bg]} style={styles.heroGradient} />
          <Pressable onPress={() => router.back()} style={styles.back}><ChevronLeft color={Colors.text} size={22} /></Pressable>
          {dish.imageVerified ? <Text style={styles.verified}>📸 {t("dish.verified")}</Text> : null}
          <Text style={styles.spice}>{spiceIcons(dish.spiceLevel)}</Text>
        </Animated.View>

        <View style={styles.body}>
          <Text style={styles.title}>{dish.name}</Text>
          <View style={styles.row}><Text style={styles.cuisine}>{dish.cuisine}</Text></View>
          <View style={styles.meta}><Clock color={Colors.muted} size={16} /><Text style={styles.metaText}>{t("dish.prepTime")} · {dish.prepTime} {t("common.min")}</Text></View>
          <Text style={styles.bigPrice}>{currencySymbol}{dish.basePrice.toFixed(2)}</Text>
          {dish.description ? (
            <>
              <Text numberOfLines={expandedDescription ? undefined : 3} style={styles.description}>{dish.description}</Text>
              <Text onPress={() => setExpandedDescription((value) => !value)} style={styles.readMore}>{expandedDescription ? "Read less" : "Read more"}</Text>
            </>
          ) : null}

          <Pressable onPress={() => setIngredientsOpen((value) => !value)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("dish.ingredients")}</Text>
            <ChevronRight color={Colors.muted} size={18} />
          </Pressable>
          {ingredientsOpen ? <View style={styles.wrap}>{dish.ingredients.map((ingredient) => <Text key={ingredient} style={styles.pill}>{ingredient}</Text>)}</View> : null}

          {dish.cook ? <CookMiniCard dish={dish} /> : null}
          <ExtrasSection title={t("dish.sauces")} extras={dish.sauces} selectedExtras={selectedExtras} onToggle={toggleExtra} currencySymbol={currencySymbol} />
          <ExtrasSection title={t("dish.drinks")} extras={dish.drinks} selectedExtras={selectedExtras} onToggle={toggleExtra} currencySymbol={currencySymbol} />

          <Text style={styles.sectionTitle}>{t("dish.instructions")}</Text>
          <TextInput value={instructions} onChangeText={(value) => setInstructions(value.slice(0, 200))} multiline placeholder={t("dish.instructionsPlaceholder")} placeholderTextColor={Colors.soft} style={styles.instructions} />
          <Text style={styles.counter}>{instructions.length}/200</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.quantity}>
          <Text onPress={() => setQuantity((value) => Math.max(1, value - 1))} style={styles.qtyButton}>−</Text>
          <Text style={styles.qtyText}>{quantity}</Text>
          <Text onPress={() => setQuantity((value) => Math.min(20, value + 1))} style={styles.qtyButton}>+</Text>
        </View>
        <View style={styles.addColumn}>
          <Pressable disabled={adding} onPress={() => addToCart(false)}>
            <Animated.View style={[styles.addButton, buttonStyle]}>
              {adding ? <ActivityIndicator color={Colors.text} /> : <Text style={styles.addText}>{t("dish.addToCart")} · {currencySymbol}{total.toFixed(2)}</Text>}
            </Animated.View>
          </Pressable>
          <Text onPress={() => addToCart(true)} style={styles.orderNow}>{t("btn.orderNow")}</Text>
        </View>
      </View>
      <CartBottomSheet open={cartOpen} onClose={() => setCartOpen(false)} />
    </View>
  );
}

function CookMiniCard({ dish }: { dish: Dish }) {
  const cook = dish.cook!;
  const t = useT();
  return (
    <Pressable onPress={() => router.push(`/cook/${cook.id}`)} style={styles.cookCard}>
      <Image source={cook.user?.avatarUrl ? { uri: cook.user.avatarUrl } : undefined} style={styles.avatar} contentFit="cover" />
      <View style={{ flex: 1 }}>
        <Text style={styles.cookName}>{cook.user?.name ?? "Home cook"} · {cook.originCountry} {cook.isVerified ? "✓" : ""}</Text>
        <Text style={styles.metaText}>★ {cook.avgRatingOverall.toFixed(1)} · {t("cook.orders", { count: cook.totalOrders })}</Text>
        <Text style={cook.isActive ? styles.available : styles.metaText}>● {cook.isActive ? t("browse.availableNow") : "Offline"}</Text>
      </View>
      <ChevronRight color={Colors.muted} size={18} />
    </Pressable>
  );
}

function ExtrasSection({ title, extras, selectedExtras, onToggle, currencySymbol }: { title: string; extras: Extra[]; selectedExtras: Extra[]; onToggle: (extra: Extra) => void; currencySymbol: string }) {
  if (extras.length === 0) return null;
  return (
    <View style={styles.extraSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {extras.map((extra) => {
        const active = selectedExtras.some((item) => item.id === extra.id);
        return (
          <Pressable key={extra.id} onPress={() => onToggle(extra)} style={styles.extraRow}>
            <Text style={[styles.checkbox, active ? styles.checkboxActive : null]}>{active ? "✓" : ""}</Text>
            <Text style={styles.extraName}>{extra.name}</Text>
            <Text style={styles.price}>+{currencySymbol}{extra.price.toFixed(2)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function spiceIcons(level: SpiceLevel): string {
  const map: Record<string, number> = { NONE: 0, MILD: 1, MEDIUM: 2, HOT: 4, VERY_HOT: 5 };
  return "🔥".repeat(map[level] ?? 0);
}

function DishSkeleton() {
  return <View style={styles.screen}><SkeletonBox width={360} height={300} radius={0} /><View style={styles.body}><SkeletonBox width={260} height={28} /><SkeletonBox width={120} height={24} /><SkeletonBox width={320} height={80} /><SkeletonBox width={320} height={96} /></View></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 140 },
  hero: { height: 300 },
  heroImage: { width: "100%", height: 300, backgroundColor: Colors.panel2 },
  heroGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: 120 },
  back: { position: "absolute", top: 48, left: Spacing.lg, width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: Radii.pill, backgroundColor: "rgba(0,0,0,0.35)" },
  verified: { position: "absolute", top: 48, right: Spacing.lg, overflow: "hidden", borderRadius: Radii.pill, backgroundColor: Colors.success, color: Colors.text, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  spice: { position: "absolute", right: Spacing.lg, bottom: Spacing.lg, fontSize: 20 },
  body: { gap: Spacing.md, padding: Spacing.lg },
  title: { ...Typography.displayMedium, color: Colors.text },
  row: { flexDirection: "row" },
  cuisine: { ...Typography.label, overflow: "hidden", borderColor: Colors.brand, borderRadius: Radii.pill, borderWidth: 1, color: Colors.brand2, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  meta: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  metaText: { ...Typography.bodySmall, color: Colors.muted },
  bigPrice: { ...Typography.headingLarge, color: Colors.brand2, fontSize: 24 },
  description: { ...Typography.body, color: Colors.muted, lineHeight: 20 },
  readMore: { ...Typography.label, color: Colors.brand2 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { ...Typography.headingMedium, color: Colors.text },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  pill: { ...Typography.bodySmall, overflow: "hidden", borderRadius: Radii.pill, backgroundColor: Colors.panel2, color: Colors.muted, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  cookCard: { flexDirection: "row", alignItems: "center", gap: Spacing.md, borderColor: Colors.line, borderRadius: Radii.lg, borderWidth: 1, backgroundColor: Colors.panel, padding: Spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.panel2 },
  cookName: { ...Typography.headingMedium, color: Colors.text },
  available: { ...Typography.bodySmall, color: Colors.success },
  extraSection: { gap: Spacing.sm },
  extraRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, borderBottomColor: Colors.line, borderBottomWidth: 1, paddingVertical: Spacing.sm },
  checkbox: { width: 24, height: 24, overflow: "hidden", borderColor: Colors.line, borderRadius: 6, borderWidth: 1, color: Colors.text, textAlign: "center", lineHeight: 22 },
  checkboxActive: { borderColor: Colors.brand, backgroundColor: Colors.brand },
  extraName: { ...Typography.body, flex: 1, color: Colors.text },
  price: { ...Typography.label, color: Colors.brand2 },
  instructions: { ...Typography.body, minHeight: 96, borderColor: Colors.line, borderRadius: Radii.md, borderWidth: 1, color: Colors.text, padding: Spacing.md, textAlignVertical: "top" },
  counter: { ...Typography.bodySmall, color: Colors.muted, textAlign: "right" },
  bottomBar: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", gap: Spacing.md, borderTopColor: Colors.line, borderTopWidth: 1, backgroundColor: Colors.panel, padding: Spacing.lg, paddingBottom: 28 },
  quantity: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  qtyButton: { width: 36, height: 36, overflow: "hidden", borderRadius: Radii.pill, backgroundColor: Colors.panel2, color: Colors.text, fontSize: 24, textAlign: "center", lineHeight: 33 },
  qtyText: { ...Typography.headingMedium, color: Colors.text },
  addColumn: { flex: 1, gap: Spacing.xs },
  addButton: { minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: Radii.md, backgroundColor: Colors.brand },
  addText: { ...Typography.button, color: Colors.text },
  orderNow: { ...Typography.label, color: Colors.brand2, textAlign: "center" }
});

import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetTextInput, BottomSheetView, type BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { CardField } from "@stripe/stripe-react-native";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { memo, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { apiRequest } from "../../services/api";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useContextStore } from "../../store/context.store";
import { FEE_CONFIG, getPaymentMethods, useCartStore, type CartItem } from "../../store/cart.store";
import { useT } from "../../store/locale.store";
import { Button } from "../ui";
import { EmptyState } from "../common/EmptyState";

export interface CartBottomSheetProps {
  open: boolean;
  onClose: () => void;
}

interface PromoResponse {
  discount: number;
}

interface OrderResponse {
  id: string;
}

function itemTotal(item: CartItem): number {
  return (item.unitPrice + item.extras.reduce((sum, extra) => sum + extra.price, 0)) * item.quantity;
}

function CartBottomSheetBase({ open, onClose }: CartBottomSheetProps) {
  const t = useT();
  const snapPoints = useMemo(() => ["50%", "90%"], []);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [address, setAddress] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const countryCode = useContextStore((state) => state.countryCode);
  const currency = useContextStore((state) => state.currency ?? "USD");
  const currencySymbol = useContextStore((state) => state.currencySymbol ?? "$");
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const total = useCartStore((state) => state.getTotal(countryCode));
  const discount = useCartStore((state) => state.discount);
  const setPromo = useCartStore((state) => state.setPromo);
  const clearCart = useCartStore((state) => state.clearCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const fees = FEE_CONFIG[countryCode ?? ""] ?? FEE_CONFIG.DEFAULT;
  const methods = getPaymentMethods(countryCode);
  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" opacity={0.58} />
  ), []);

  async function applyPromo(): Promise<void> {
    try {
      const response = await apiRequest<PromoResponse>("/api/payments/promo", { method: "POST", body: JSON.stringify({ code: promoInput }) });
      setPromo(promoInput, response.discount);
    } catch {
      setPromo(null, 0);
      Alert.alert(t("toast.error"), "Promo code is not valid yet.");
    }
  }

  async function fillLocation(): Promise<void> {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") return;
    const position = await Location.getCurrentPositionAsync({});
    const [place] = await Location.reverseGeocodeAsync(position.coords);
    setAddress([place?.name, place?.city, place?.country].filter(Boolean).join(", "));
  }

  async function placeOrder(): Promise<void> {
    if (!paymentMethod || !address || items.length === 0) return;
    setLoading(true);
    try {
      const order = await apiRequest<OrderResponse>("/api/orders", {
        auth: true,
        method: "POST",
        body: JSON.stringify({
          cookId: items[0]!.cookId,
          deliveryAddress: address,
          paymentMethod,
          currency,
          items: items.map((item) => ({ dishId: item.dishId, quantity: item.quantity, extras: item.extras, note: item.note }))
        })
      });
      clearCart();
      onClose();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push(`/order/${order.id}`);
    } catch (error) {
      Alert.alert(t("toast.error"), error instanceof Error ? error.message : t("toast.error"));
    } finally {
      setLoading(false);
    }
  }

  const renderItem = useCallback(({ item }: { item: CartItem }) => (
    <Swipeable
      renderRightActions={() => (
        <Pressable
          style={styles.deleteAction}
          onPress={() => {
            removeItem(item.id);
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Trash2 color={Colors.text} size={18} />
        </Pressable>
      )}
    >
      <View style={styles.cartRow}>
        <Image source={item.imageUrl ? { uri: item.imageUrl } : undefined} style={styles.thumb} contentFit="cover" />
        <View style={styles.rowMain}>
          <Text style={styles.itemName} numberOfLines={1}>{item.dishName}</Text>
          <Text style={styles.muted} numberOfLines={1}>{item.cookName}</Text>
          {item.extras.length > 0 ? <Text style={styles.muted} numberOfLines={1}>{item.extras.map((extra) => extra.name).join(", ")}</Text> : null}
          <View style={styles.stepper}>
            <Text onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.step}>−</Text>
            <Text style={styles.qty}>{item.quantity}</Text>
            <Text onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.step}>+</Text>
          </View>
        </View>
        <Text style={styles.price}>{currencySymbol}{itemTotal(item).toFixed(2)}</Text>
      </View>
    </Swipeable>
  ), [currencySymbol, removeItem, updateQuantity]);

  return (
    <BottomSheet
      index={open ? sheetIndex : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      onChange={(index) => setSheetIndex(Math.max(0, index))}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>{t("cart.title")}</Text>
        {items.length === 0 ? (
          <EmptyState type="dishes" onAction={() => { onClose(); router.navigate("/(tabs)/browse"); }} />
        ) : (
          <>
            <BottomSheetFlatList data={items} keyExtractor={(item) => item.id} renderItem={renderItem} style={styles.list} />
            <View style={styles.summary}>
              <SummaryLine label={t("cart.subtotal")} value={`${currencySymbol}${subtotal.toFixed(2)}`} />
              <SummaryLine label={t("cart.deliveryFee")} value={`${currencySymbol}${fees.deliveryFee.toFixed(2)}`} />
              <SummaryLine label={t("cart.serviceFee")} value={`${currencySymbol}${fees.serviceFee.toFixed(2)}`} />
              <View style={styles.promoRow}>
                <BottomSheetTextInput value={promoInput} onChangeText={setPromoInput} placeholder={t("cart.promo")} placeholderTextColor={Colors.soft} style={styles.input} />
                <Button variant="secondary" onPress={() => void applyPromo()}>Apply</Button>
              </View>
              {discount > 0 ? <SummaryLine label="Discount" value={`-${currencySymbol}${discount.toFixed(2)}`} /> : null}
              <Text style={styles.sectionTitle}>{t("checkout.payment")}</Text>
              <View style={styles.paymentGrid}>
                {methods.map((method) => (
                  <Text key={method} onPress={() => setPaymentMethod(method)} style={[styles.paymentCard, paymentMethod === method ? styles.paymentActive : null]}>{methodIcon(method)} {method}</Text>
                ))}
              </View>
              {paymentMethod === "Visa" || paymentMethod === "Mastercard" ? <CardField postalCodeEnabled={false} style={styles.cardField} /> : null}
              <BottomSheetTextInput value={address} onChangeText={setAddress} placeholder={t("checkout.address")} placeholderTextColor={Colors.soft} style={styles.input} />
              <Button variant="secondary" onPress={() => void fillLocation()}>Use my location</Button>
              <SummaryLine label={t("cart.total")} value={`${currencySymbol}${total.toFixed(2)}`} large />
              <Button disabled={!address || !paymentMethod || loading} onPress={() => {
                setSheetIndex(1);
                router.push("/checkout");
              }}>
                {loading ? <ActivityIndicator color={Colors.text} /> : t("checkout.title")}
              </Button>
              <Button variant="ghost" disabled={!address || !paymentMethod || loading} onPress={() => void placeOrder()}>{t("btn.placeOrder")}</Button>
            </View>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

function methodIcon(method: string): string {
  const icons: Record<string, string> = { Visa: "💳", Mastercard: "💳", "Apple Pay": "", "Google Pay": "G", PayPal: "P", Cash: "💵", iyzico: "⚡", Papara: "📱", Troy: "🇹🇷", Klarna: "K", SEPA: "🏦", Fawry: "🏧", Bizum: "📲", Mada: "💳", "STC Pay": "📱", "Vodafone Cash": "📱", InstaPay: "⚡", "Faster Payments": "⚡", Sofort: "⚡", "EFT/Havale": "🏦", PayTR: "💳" };
  return icons[method] ?? "💳";
}

function SummaryLine({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <View style={styles.summaryLine}>
      <Text style={[styles.summaryLabel, large ? styles.large : null]}>{label}</Text>
      <Text style={[styles.summaryValue, large ? styles.large : null]}>{value}</Text>
    </View>
  );
}

export const CartBottomSheet = memo(CartBottomSheetBase);

const styles = StyleSheet.create({
  sheet: { backgroundColor: Colors.panel },
  handle: { backgroundColor: Colors.soft },
  content: { flex: 1, gap: Spacing.md, padding: Spacing.lg },
  title: { ...Typography.headingLarge, color: Colors.text },
  list: { maxHeight: 240 },
  cartRow: { minHeight: 76, flexDirection: "row", gap: Spacing.md, alignItems: "center", borderBottomColor: Colors.line, borderBottomWidth: 1, paddingVertical: Spacing.sm, backgroundColor: Colors.panel },
  thumb: { width: 50, height: 50, borderRadius: Radii.md, backgroundColor: Colors.panel2 },
  rowMain: { flex: 1, gap: 2 },
  itemName: { ...Typography.headingMedium, color: Colors.text },
  muted: { ...Typography.bodySmall, color: Colors.muted },
  price: { ...Typography.button, color: Colors.brand2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginTop: Spacing.xs },
  step: { width: 24, height: 24, overflow: "hidden", borderRadius: Radii.pill, backgroundColor: Colors.panel2, color: Colors.text, textAlign: "center", lineHeight: 24 },
  qty: { ...Typography.label, color: Colors.text },
  deleteAction: { width: 70, alignItems: "center", justifyContent: "center", backgroundColor: Colors.error },
  summary: { gap: Spacing.md },
  summaryLine: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { ...Typography.body, color: Colors.muted },
  summaryValue: { ...Typography.body, color: Colors.text },
  large: { ...Typography.headingMedium, color: Colors.text },
  promoRow: { flexDirection: "row", gap: Spacing.sm },
  input: { ...Typography.body, minHeight: 46, flex: 1, borderColor: Colors.line, borderRadius: Radii.md, borderWidth: 1, color: Colors.text, paddingHorizontal: Spacing.md },
  sectionTitle: { ...Typography.label, color: Colors.muted, textTransform: "uppercase" },
  paymentGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  paymentCard: { ...Typography.bodySmall, width: "48%", overflow: "hidden", borderColor: Colors.line, borderRadius: Radii.md, borderWidth: 1, color: Colors.muted, padding: Spacing.md },
  paymentActive: { borderColor: Colors.brand, backgroundColor: "rgba(249,115,22,0.14)", color: Colors.text },
  cardField: { height: 48, borderRadius: Radii.md, backgroundColor: Colors.text }
});

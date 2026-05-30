import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { WebView } from "react-native-webview";
import { apiRequest } from "../services/api";
import { Colors, Radii, Spacing, Typography } from "../constants/theme";
import { FEE_CONFIG, getPaymentMethods, useCartStore } from "../store/cart.store";
import { useContextStore } from "../store/context.store";
import { useT } from "../store/locale.store";
import { Button } from "../components/ui";

interface PaymentIntentResponse {
  clientSecret: string;
}

interface IyzicoIntentResponse {
  paymentPageUrl: string;
  token: string;
}

interface OrderResponse {
  id: string;
}

export default function CheckoutScreen() {
  const t = useT();
  const { confirmPayment } = useConfirmPayment();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartStore((state) => state.getTotal(useContextStore.getState().countryCode));
  const discount = useCartStore((state) => state.discount);
  const countryCode = useContextStore((state) => state.countryCode);
  const currency = useContextStore((state) => state.currency ?? "USD");
  const currencySymbol = useContextStore((state) => state.currencySymbol ?? "$");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [iyzicoUrl, setIyzicoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fees = FEE_CONFIG[countryCode ?? ""] ?? FEE_CONFIG.DEFAULT;
  const methods = useMemo(() => getPaymentMethods(countryCode), [countryCode]);
  const estimate = items[0]?.quantity ? "~45 min" : "~30 min";

  async function fillLocation(): Promise<void> {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") return;
    const position = await Location.getCurrentPositionAsync({});
    const [place] = await Location.reverseGeocodeAsync(position.coords);
    setAddress([place?.name, place?.city, place?.country].filter(Boolean).join(", "));
  }

  async function createOrder(method: string): Promise<OrderResponse> {
    if (items.length === 0) throw new Error("Cart is empty");
    return apiRequest<OrderResponse>("/api/orders", {
      auth: true,
      method: "POST",
      body: JSON.stringify({
        cookId: items[0]!.cookId,
        deliveryAddress: address,
        paymentMethod: method,
        currency,
        items: items.map((item) => ({ dishId: item.dishId, quantity: item.quantity, extras: item.extras, note: item.note }))
      })
    });
  }

  async function handlePayment(): Promise<void> {
    if (!paymentMethod || !address) return;
    setLoading(true);
    try {
      if (paymentMethod.toLowerCase() === "cash") {
        const order = await createOrder("cash");
        clearCart();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace(`/order/${order.id}`);
        return;
      }

      if (countryCode === "TR" && ["iyzico", "Papara", "Troy"].includes(paymentMethod)) {
        const order = await createOrder(paymentMethod);
        setPendingOrderId(order.id);
        const intent = await apiRequest<IyzicoIntentResponse>("/api/payments/iyzico/intent", {
          auth: true,
          method: "POST",
          body: JSON.stringify({ orderId: order.id, amount: total, currency })
        });
        setIyzicoUrl(intent.paymentPageUrl);
        return;
      }

      const order = await createOrder(paymentMethod);
      setPendingOrderId(order.id);
      const intent = await apiRequest<PaymentIntentResponse>("/api/payments/intent", {
        auth: true,
        method: "POST",
        body: JSON.stringify({ amount: total, currency, orderId: order.id })
      });
      const result = await confirmPayment(intent.clientSecret, { paymentMethodType: "Card" });
      if (result.error) throw new Error(result.error.message);
      await apiRequest("/api/payments/confirm", {
        auth: true,
        method: "POST",
        body: JSON.stringify({ paymentIntentId: result.paymentIntent?.id, orderId: order.id })
      });
      clearCart();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/order/${order.id}`);
    } catch (error) {
      Alert.alert(t("toast.error"), error instanceof Error ? error.message : t("toast.error"));
    } finally {
      setLoading(false);
    }
  }

  if (iyzicoUrl) {
    return (
      <WebView
        source={{ uri: iyzicoUrl }}
        onNavigationStateChange={(event) => {
          if (event.url.includes("success") && pendingOrderId) {
            clearCart();
            router.replace(`/order/${pendingOrderId}`);
          }
        }}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><ChevronLeft color={Colors.text} size={22} /></Pressable>
        <Text style={styles.headerTitle}>{t("checkout.title")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Order summary">
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.quantity}× {item.dishName}</Text>
              <Text style={styles.muted}>{item.cookName}</Text>
            </View>
          ))}
        </Section>
        <Section title={t("checkout.address")}>
          <TextInput value={address} onChangeText={setAddress} placeholder={t("checkout.address")} placeholderTextColor={Colors.soft} style={styles.input} />
          <Button variant="secondary" onPress={() => void fillLocation()}>Use my location</Button>
        </Section>
        <Section title="Delivery estimate"><Text style={styles.value}>{estimate}</Text></Section>
        <Section title={t("checkout.payment")}>
          <View style={styles.paymentGrid}>
            {methods.map((method) => (
              <Text key={method} onPress={() => setPaymentMethod(method)} style={[styles.paymentCard, paymentMethod === method ? styles.paymentActive : null]}>{method}</Text>
            ))}
          </View>
          {paymentMethod && !["Cash", "iyzico", "Papara", "Troy"].includes(paymentMethod) ? <CardField postalCodeEnabled={false} style={styles.cardField} /> : null}
        </Section>
        <Section title={t("cart.total")}>
          <Line label={t("cart.subtotal")} value={`${currencySymbol}${subtotal.toFixed(2)}`} />
          <Line label={t("cart.deliveryFee")} value={`${currencySymbol}${fees.deliveryFee.toFixed(2)}`} />
          <Line label={t("cart.serviceFee")} value={`${currencySymbol}${fees.serviceFee.toFixed(2)}`} />
          {discount > 0 ? <Line label="Promo" value={`-${currencySymbol}${discount.toFixed(2)}`} /> : null}
          <Line label={t("cart.total")} value={`${currencySymbol}${total.toFixed(2)}`} large />
        </Section>
        <Button disabled={!address || !paymentMethod || loading || items.length === 0} onPress={() => void handlePayment()}>
          {loading ? <ActivityIndicator color={Colors.text} /> : "Confirm & Pay"}
        </Button>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

function Line({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return <View style={styles.line}><Text style={[styles.muted, large ? styles.large : null]}>{label}</Text><Text style={[styles.value, large ? styles.large : null]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: { minHeight: 92, flexDirection: "row", alignItems: "flex-end", gap: Spacing.md, borderBottomColor: Colors.line, borderBottomWidth: 1, padding: Spacing.lg },
  back: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: Radii.pill, backgroundColor: Colors.panel },
  headerTitle: { ...Typography.headingLarge, color: Colors.text, paddingBottom: Spacing.sm },
  content: { gap: Spacing.lg, padding: Spacing.lg, paddingBottom: 120 },
  section: { gap: Spacing.md, borderColor: Colors.line, borderRadius: Radii.lg, borderWidth: 1, backgroundColor: Colors.panel, padding: Spacing.md },
  sectionTitle: { ...Typography.headingMedium, color: Colors.text },
  itemRow: { gap: 2 },
  itemName: { ...Typography.body, color: Colors.text },
  muted: { ...Typography.bodySmall, color: Colors.muted },
  value: { ...Typography.body, color: Colors.text },
  input: { ...Typography.body, minHeight: 48, borderColor: Colors.line, borderRadius: Radii.md, borderWidth: 1, color: Colors.text, paddingHorizontal: Spacing.md },
  paymentGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  paymentCard: { ...Typography.bodySmall, width: "48%", overflow: "hidden", borderColor: Colors.line, borderRadius: Radii.md, borderWidth: 1, color: Colors.muted, padding: Spacing.md },
  paymentActive: { borderColor: Colors.brand, backgroundColor: "rgba(249,115,22,0.14)", color: Colors.text },
  cardField: { height: 48, borderRadius: Radii.md, backgroundColor: Colors.text },
  line: { flexDirection: "row", justifyContent: "space-between" },
  large: { ...Typography.headingMedium, color: Colors.text }
});

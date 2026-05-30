import { OrderStatus, RefundReason, type Order, type RefundRequest } from "@hometaste/types";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, MessageCircle } from "lucide-react-native";
import { MotiView } from "moti";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView, type BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { apiRequest } from "../../services/api";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useOrderTracking } from "../../hooks/useOrderTracking";
import { useT } from "../../store/locale.store";
import { Button } from "../../components/ui";
import { SkeletonBox } from "../../components/common/Skeleton";
import { RatingSheet } from "../../components/rating/RatingSheet";

const steps = [
  OrderStatus.Placed,
  OrderStatus.Accepted,
  OrderStatus.Preparing,
  OrderStatus.Ready,
  OrderStatus.CourierAssigned,
  OrderStatus.PickedUp,
  OrderStatus.OnTheWay,
  OrderStatus.Delivered
];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const { courierLocation } = useOrderTracking(id ?? "");
  const { data: order, isLoading, refetch } = useQuery<Order, Error>({
    queryKey: ["order", id],
    queryFn: () => apiRequest<Order>(`/api/orders/${id}`, { auth: true }),
    enabled: Boolean(id)
  });
  const eta = useMemo(() => order ? estimateEta(order.createdAt, order.cook?.prepTime) : "~30 min", [order]);
  useEffect(() => {
    if (order?.status !== OrderStatus.Delivered) return;
    const timeout = setTimeout(() => setRatingOpen(true), 2000);
    return () => clearTimeout(timeout);
  }, [order?.status]);

  if (isLoading || !order) return <View style={styles.screen}><SkeletonBox width={340} height={600} /></View>;
  const currentIndex = Math.max(0, steps.indexOf(order.status));
  const showMap = [OrderStatus.CourierAssigned, OrderStatus.PickedUp, OrderStatus.OnTheWay].includes(order.status);
  const cancellable = [OrderStatus.Placed, OrderStatus.Accepted].includes(order.status);
  const refundable = order.status === OrderStatus.Delivered && Date.now() - new Date(order.updatedAt ?? order.createdAt).getTime() <= 24 * 60 * 60 * 1000;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><ChevronLeft color={Colors.text} size={22} /></Pressable>
        <Text style={styles.headerTitle}>Order #{order.id.slice(0, 6)}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eta, eta.includes("~4") ? styles.etaSoon : null]}>Arriving in {eta}</Text>
        <View style={styles.card}>
          {steps.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepIconWrap}>
                {index === currentIndex ? <MotiView from={{ scale: 0.9 }} animate={{ scale: 1.15 }} transition={{ loop: true, type: "timing", duration: 800 }} style={styles.currentPulse} /> : null}
                <View style={[styles.stepCircle, index <= currentIndex ? styles.stepDone : null]}><Text style={styles.check}>{index <= currentIndex ? "✓" : ""}</Text></View>
                {index < steps.length - 1 ? <View style={[styles.stepLine, index < currentIndex ? styles.lineDone : null]} /> : null}
              </View>
              <View style={styles.stepText}>
                <Text style={styles.stepLabel}>{t(`order.tracking.${trackingKey(step)}`)}</Text>
                {index <= currentIndex ? <Text style={styles.muted}>{timestampFor(order, step)}</Text> : null}
              </View>
            </View>
          ))}
        </View>
        {showMap ? (
          <View style={styles.mapWrap}>
            <MapView style={styles.map} initialRegion={{ latitude: 41.0082, longitude: 28.9784, latitudeDelta: 0.08, longitudeDelta: 0.08 }}>
              <Marker coordinate={{ latitude: 41.0082, longitude: 28.9784 }} title="Cook" description="🍳" />
              <Marker coordinate={{ latitude: 41.0182, longitude: 28.9884 }} title="Delivery" description="📍" />
              {courierLocation ? <Marker coordinate={{ latitude: courierLocation.lat, longitude: courierLocation.lng }} title="Courier" description="🛵" /> : null}
            </MapView>
          </View>
        ) : <View style={styles.illustration}><Text style={styles.illustrationText}>🍳</Text></View>}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{order.cook?.user?.name ?? "Cook"}</Text>
          {order.items.map((item) => <Text key={item.id} style={styles.muted}>{item.quantity}× {item.dish?.name}</Text>)}
          <Text style={styles.muted}>{order.paymentMethod} · {order.currency} {order.totalAmount.toFixed(2)}</Text>
          <Text style={styles.muted}>{order.deliveryAddress}</Text>
        </View>
        <Button onPress={() => router.push(`/order/${order.id}/chat`)}><MessageCircle color={Colors.text} size={18} /> Chat with Cook</Button>
        {cancellable ? <Button variant="secondary" onPress={() => setCancelOpen(true)}>Cancel Order</Button> : null}
        {refundable ? <Button variant="secondary" onPress={() => setRefundOpen(true)}>{t("order.requestRefund")}</Button> : null}
      </ScrollView>
      <CancelOrderSheet open={cancelOpen} orderId={order.id} onClose={() => setCancelOpen(false)} onCancelled={() => void refetch()} />
      <RefundSheet open={refundOpen} orderId={order.id} onClose={() => setRefundOpen(false)} />
      <RatingSheet order={order} open={ratingOpen} onClose={() => setRatingOpen(false)} />
    </View>
  );
}

function RefundSheet({ open, orderId, onClose }: { open: boolean; orderId: string; onClose: () => void }) {
  const t = useT();
  const [reason, setReason] = useState<RefundReason>(RefundReason.FoodQuality);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const snapPoints = useMemo(() => ["70%"], []);
  const renderBackdrop = (props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />;
  const reasons: Array<{ value: RefundReason; label: string }> = [
    { value: RefundReason.NotDelivered, label: t("refund.reason.notDelivered") },
    { value: RefundReason.WrongItems, label: t("refund.reason.wrongItems") },
    { value: RefundReason.FoodQuality, label: t("refund.reason.foodQuality") },
    { value: RefundReason.CookCancelled, label: t("refund.reason.cookCancelled") },
    { value: RefundReason.Other, label: t("refund.reason.other") }
  ];

  async function submitRefund(): Promise<void> {
    try {
      const response = await apiRequest<{ refund: RefundRequest }>(`/api/orders/${orderId}/refund`, {
        auth: true,
        method: "POST",
        body: JSON.stringify({ reason, description })
      });
      setStatus(t(`refund.status.${response.refund.status}`));
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Could not request refund");
    }
  }

  return (
    <BottomSheet index={open ? 0 : -1} snapPoints={snapPoints} enablePanDownToClose onClose={onClose} backdropComponent={renderBackdrop} backgroundStyle={styles.sheet}>
      <BottomSheetView style={styles.sheetContent}>
        <Text style={styles.sectionTitle}>{t("refund.title")}</Text>
        <Text style={styles.muted}>{t("refund.policyNote")}</Text>
        {reasons.map((item) => <Text key={item.value} onPress={() => setReason(item.value)} style={[styles.reason, reason === item.value ? styles.reasonActive : null]}>{item.label}</Text>)}
        <TextInput value={description} onChangeText={setDescription} placeholder={t("refund.descriptionPlaceholder")} placeholderTextColor={Colors.soft} multiline style={[styles.input, styles.refundInput]} />
        {status ? <Text style={styles.status}>{status}</Text> : null}
        <Button onPress={() => void submitRefund()}>{t("refund.submit")}</Button>
      </BottomSheetView>
    </BottomSheet>
  );
}

function CancelOrderSheet({ open, orderId, onClose, onCancelled }: { open: boolean; orderId: string; onClose: () => void; onCancelled: () => void }) {
  const [reason, setReason] = useState("changed_mind");
  const [custom, setCustom] = useState("");
  const snapPoints = useMemo(() => ["45%"], []);
  const renderBackdrop = (props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />;
  async function cancel(): Promise<void> {
    try {
      await apiRequest(`/api/orders/${orderId}/cancel`, { auth: true, method: "POST", body: JSON.stringify({ reason: reason === "other" ? custom : reason }) });
      onCancelled();
      onClose();
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Could not cancel order");
    }
  }
  return (
    <BottomSheet index={open ? 0 : -1} snapPoints={snapPoints} enablePanDownToClose onClose={onClose} backdropComponent={renderBackdrop} backgroundStyle={styles.sheet}>
      <BottomSheetView style={styles.sheetContent}>
        <Text style={styles.sectionTitle}>Cancel order</Text>
        {["changed_mind", "too_long", "mistake", "other"].map((item) => <Text key={item} onPress={() => setReason(item)} style={[styles.reason, reason === item ? styles.reasonActive : null]}>{item.replace("_", " ")}</Text>)}
        {reason === "other" ? <TextInput value={custom} onChangeText={setCustom} placeholder="Reason" placeholderTextColor={Colors.soft} style={styles.input} /> : null}
        <Button onPress={() => void cancel()}>Confirm Cancellation</Button>
      </BottomSheetView>
    </BottomSheet>
  );
}

function trackingKey(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    [OrderStatus.Placed]: "placed",
    [OrderStatus.Accepted]: "accepted",
    [OrderStatus.Preparing]: "preparing",
    [OrderStatus.Ready]: "ready",
    [OrderStatus.CourierAssigned]: "courier",
    [OrderStatus.PickedUp]: "pickedUp",
    [OrderStatus.OnTheWay]: "onTheWay",
    [OrderStatus.Delivered]: "delivered",
    [OrderStatus.Cancelled]: "cancelled"
  };
  return map[status];
}

function timestampFor(order: Order, status: OrderStatus): string {
  const found = order.statusHistory.find((entry) => entry.status === status);
  return found ? new Date(found.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
}

function estimateEta(createdAt: string, prepTime?: string | null): string {
  const prep = Number(prepTime?.match(/\d+/)?.[0] ?? 35);
  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  return `~${Math.max(4, prep + 15 - elapsed)} minutes`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: { minHeight: 92, flexDirection: "row", alignItems: "flex-end", gap: Spacing.md, borderBottomColor: Colors.line, borderBottomWidth: 1, padding: Spacing.lg },
  back: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: Radii.pill, backgroundColor: Colors.panel },
  headerTitle: { ...Typography.headingLarge, color: Colors.text, paddingBottom: Spacing.sm },
  content: { gap: Spacing.lg, padding: Spacing.lg, paddingBottom: 120 },
  eta: { ...Typography.headingMedium, color: Colors.text },
  etaSoon: { color: Colors.success },
  card: { gap: Spacing.md, borderColor: Colors.line, borderRadius: Radii.lg, borderWidth: 1, backgroundColor: Colors.panel, padding: Spacing.md },
  stepRow: { flexDirection: "row", gap: Spacing.md, minHeight: 56 },
  stepIconWrap: { width: 28, alignItems: "center" },
  currentPulse: { position: "absolute", width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(249,115,22,0.18)" },
  stepCircle: { width: 24, height: 24, alignItems: "center", justifyContent: "center", borderColor: Colors.line, borderRadius: 12, borderWidth: 1 },
  stepDone: { borderColor: Colors.brand, backgroundColor: Colors.brand },
  check: { color: Colors.text, fontSize: 12 },
  stepLine: { width: 2, flex: 1, backgroundColor: Colors.line },
  lineDone: { backgroundColor: Colors.brand },
  stepText: { flex: 1 },
  stepLabel: { ...Typography.body, color: Colors.text },
  muted: { ...Typography.bodySmall, color: Colors.muted },
  mapWrap: { height: 220, overflow: "hidden", borderRadius: Radii.lg },
  map: { flex: 1 },
  illustration: { height: 180, alignItems: "center", justifyContent: "center", borderRadius: Radii.lg, backgroundColor: Colors.panel },
  illustrationText: { fontSize: 48 },
  sectionTitle: { ...Typography.headingMedium, color: Colors.text },
  sheet: { backgroundColor: Colors.panel },
  sheetContent: { gap: Spacing.md, padding: Spacing.lg },
  reason: { ...Typography.body, overflow: "hidden", borderColor: Colors.line, borderRadius: Radii.md, borderWidth: 1, color: Colors.muted, padding: Spacing.md },
  reasonActive: { borderColor: Colors.brand, color: Colors.text },
  input: { ...Typography.body, minHeight: 48, borderColor: Colors.line, borderRadius: Radii.md, borderWidth: 1, color: Colors.text, paddingHorizontal: Spacing.md },
  refundInput: { minHeight: 96, paddingVertical: Spacing.md, textAlignVertical: "top" },
  status: { ...Typography.body, color: Colors.success }
});

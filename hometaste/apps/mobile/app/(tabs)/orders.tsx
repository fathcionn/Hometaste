import { OrderStatus, type Order } from "@hometaste/types";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { apiRequest } from "../../services/api";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useCartStore } from "../../store/cart.store";
import { Button } from "../../components/ui";

export default function OrdersScreen() {
  const [tab, setTab] = useState<"active" | "past">("active");
  const addItem = useCartStore((state) => state.addItem);
  const { data = [] } = useQuery<Order[], Error>({ queryKey: ["orders"], queryFn: () => apiRequest<Order[]>("/api/orders", { auth: true }) });
  const orders = useMemo(() => data.filter((order) => tab === "active" ? ![OrderStatus.Delivered, OrderStatus.Cancelled].includes(order.status) : [OrderStatus.Delivered, OrderStatus.Cancelled].includes(order.status)), [data, tab]);
  return (
    <View style={styles.screen}>
      <View style={styles.tabs}><Tab label="Active" active={tab === "active"} onPress={() => setTab("active")} /><Tab label="Past" active={tab === "past"} onPress={() => setTab("past")} /></View>
      <ScrollView contentContainerStyle={styles.list}>
        {orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.title}>Order #{order.id.slice(0, 6)}</Text>
            <Text style={[styles.status, liveStatuses.includes(order.status) ? styles.pulse : null]}>{order.status}</Text>
            <Text style={styles.muted}>{order.items.map((item) => item.dish?.name).join(", ")}</Text>
            <View style={styles.actions}>
              {tab === "active" ? <Button onPress={() => router.push(`/order/${order.id}`)}>Track</Button> : <Button variant="secondary" onPress={() => order.items.forEach((item) => item.dish && addItem({ dishId: item.dish.id, dishName: item.dish.name, imageUrl: item.dish.imageUrl ?? null, cookId: order.cookId, cookName: order.cook?.user?.name ?? "Cook", quantity: item.quantity, unitPrice: item.unitPrice, extras: item.extras, note: item.note ?? "" }))}>Reorder</Button>}
              <Button variant="secondary" onPress={() => router.push(`/order/${order.id}/chat`)}>Chat</Button>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const liveStatuses = [OrderStatus.Preparing, OrderStatus.OnTheWay];
function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.tab, active ? styles.tabActive : null]}><Text style={styles.tabText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg, paddingTop: 64 },
  tabs: { flexDirection: "row", gap: Spacing.md, paddingHorizontal: Spacing.lg },
  tab: { flex: 1, alignItems: "center", borderBottomColor: Colors.line, borderBottomWidth: 2, padding: Spacing.md },
  tabActive: { borderBottomColor: Colors.brand },
  tabText: { ...Typography.headingMedium, color: Colors.text },
  list: { gap: Spacing.md, padding: Spacing.lg },
  card: { gap: Spacing.sm, borderColor: Colors.line, borderRadius: Radii.lg, borderWidth: 1, backgroundColor: Colors.panel, padding: Spacing.md },
  title: { ...Typography.headingMedium, color: Colors.text },
  status: { ...Typography.label, color: Colors.brand2 },
  pulse: { color: Colors.success },
  muted: { ...Typography.bodySmall, color: Colors.muted },
  actions: { flexDirection: "row", gap: Spacing.sm }
});

import { OrderStatus, type Order } from "@hometaste/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { LocationPermissionSheet } from "../../components/common/LocationPermissionSheet";
import { apiRequest } from "../../services/api";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { Button } from "../../components/ui";
import { useCookLocation } from "../../hooks/useCookLocation";

interface StudioOrdersResponse {
  orders: Order[];
}

export default function CookStudioScreen() {
  const queryClient = useQueryClient();
  const [pendingLocationCookId, setPendingLocationCookId] = useState<string | null>(null);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const { updateCookLocation } = useCookLocation();
  const { data } = useQuery<StudioOrdersResponse, Error>({ queryKey: ["cook-studio", "orders"], queryFn: () => apiRequest<StudioOrdersResponse>("/api/cook/studio/orders", { auth: true }) });
  const online = useMutation({
    mutationFn: (isActive: boolean) => apiRequest<{ id: string }>("/api/cook/studio/online", { auth: true, method: "POST", body: JSON.stringify({ isActive }) }),
    onSuccess: (cook, isActive) => {
      if (!isActive) return;
      void maybeUpdateLocation(cook.id);
    }
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => apiRequest(`/api/orders/${id}/status`, { auth: true, method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cook-studio", "orders"] })
  });
  const orders = data?.orders ?? [];
  async function maybeUpdateLocation(cookId: string): Promise<void> {
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status === "undetermined") {
      setPendingLocationCookId(cookId);
      setShowLocationSheet(true);
      return;
    }
    updateCookLocation(cookId).catch(() => {});
  }

  function allowLocation(): void {
    const cookId = pendingLocationCookId;
    setPendingLocationCookId(null);
    setShowLocationSheet(false);
    if (cookId) updateCookLocation(cookId).catch(() => {});
  }

  return (
    <>
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>Cook Studio</Text>
      <View style={styles.stats}><Stat value={String(orders.length)} label="Orders today" /><Stat value="$0" label="Revenue today" /></View>
      <View style={styles.online}><Text style={styles.sectionTitle}>Online</Text><Switch onValueChange={(value) => online.mutate(value)} trackColor={{ true: Colors.brand, false: Colors.line }} /></View>
      <Text style={styles.sectionTitle}>Incoming orders</Text>
      {orders.map((order) => (
        <View key={order.id} style={styles.card}>
          <Text style={styles.sectionTitle}>{order.customer?.name ?? "Customer"}</Text>
          <Text style={styles.muted}>{order.items.map((item) => `${item.quantity}× ${item.dish?.name}`).join(", ")}</Text>
          <Text style={styles.muted}>{order.customerNote ?? "No notes"}</Text>
          <View style={styles.actions}>
            <Button onPress={() => updateStatus.mutate({ id: order.id, status: OrderStatus.Accepted })}>Accept</Button>
            <Button variant="secondary" onPress={() => updateStatus.mutate({ id: order.id, status: OrderStatus.Cancelled })}>Decline</Button>
          </View>
        </View>
      ))}
      <Text style={styles.sectionTitle}>My dishes</Text>
      <Button>Add new dish</Button>
    </ScrollView>
    <LocationPermissionSheet visible={showLocationSheet} onAllow={allowLocation} onSkip={() => setShowLocationSheet(false)} />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.muted}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, gap: Spacing.lg, backgroundColor: Colors.bg, padding: Spacing.lg, paddingTop: 64 },
  title: { ...Typography.displayMedium, color: Colors.text },
  stats: { flexDirection: "row", gap: Spacing.md },
  stat: { flex: 1, borderColor: Colors.line, borderRadius: Radii.lg, borderWidth: 1, backgroundColor: Colors.panel, padding: Spacing.md },
  statValue: { ...Typography.headingLarge, color: Colors.brand2 },
  online: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderColor: Colors.line, borderRadius: Radii.lg, borderWidth: 1, backgroundColor: Colors.panel, padding: Spacing.md },
  sectionTitle: { ...Typography.headingMedium, color: Colors.text },
  muted: { ...Typography.bodySmall, color: Colors.muted },
  card: { gap: Spacing.sm, borderColor: Colors.line, borderRadius: Radii.lg, borderWidth: 1, backgroundColor: Colors.panel, padding: Spacing.md },
  actions: { flexDirection: "row", gap: Spacing.sm }
});

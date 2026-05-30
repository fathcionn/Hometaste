import type { Order } from "@hometaste/types";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { apiRequest } from "../../services/api";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";

export default function MessagesScreen() {
  const { data = [] } = useQuery<Order[], Error>({ queryKey: ["orders", "messages"], queryFn: () => apiRequest<Order[]>("/api/orders", { auth: true }) });
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      {data.map((order) => (
        <View key={order.id} onTouchEnd={() => router.push(`/order/${order.id}/chat`)} style={styles.row}>
          <Image source={order.cook?.user?.avatarUrl ? { uri: order.cook.user.avatarUrl } : undefined} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{order.cook?.user?.name ?? "Cook"}</Text>
            <Text style={styles.muted}>{order.items[0]?.dish?.name ?? "Order chat"} · {order.status}</Text>
          </View>
          <Text style={styles.badge}>1</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, gap: Spacing.md, backgroundColor: Colors.bg, padding: Spacing.lg, paddingTop: 64 },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.md, borderColor: Colors.line, borderRadius: Radii.lg, borderWidth: 1, backgroundColor: Colors.panel, padding: Spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.panel2 },
  title: { ...Typography.headingMedium, color: Colors.text },
  muted: { ...Typography.bodySmall, color: Colors.muted },
  badge: { overflow: "hidden", borderRadius: Radii.pill, backgroundColor: Colors.brand, color: Colors.text, paddingHorizontal: Spacing.sm }
});

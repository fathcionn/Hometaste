import { Role } from "@hometaste/types";
import { router } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useAuthStore } from "../../store/auth.store";
import { useContextStore } from "../../store/context.store";
import { useLocaleStore } from "../../store/locale.store";
import { Button } from "../../components/ui";

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const currency = useContextStore((state) => state.currency ?? "USD");
  if (!user) {
    return <View style={styles.center}><Text style={styles.title}>Welcome to HomeTaste</Text><Button onPress={() => router.push("/(auth)/login")}>Log In</Button><Button variant="secondary" onPress={() => router.push("/(auth)/signup")}>Sign Up</Button></View>;
  }
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>{user.name}</Text>
      <Text style={styles.muted}>{user.email}</Text>
      {user.role !== Role.Cook ? <Button onPress={() => router.push("/become-cook")}>Become a Cook</Button> : <Button onPress={() => router.push("/cook/studio")}>Cook Studio</Button>}
      {user.role === Role.Cook ? <View style={styles.card}><Text style={styles.title}>Cook stats</Text><Text style={styles.muted}>Orders · Revenue · Rating</Text></View> : null}
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.langs}>{["en", "ar", "tr"].map((locale) => <Text key={locale} onPress={() => setLocale(locale)} style={styles.chip}>{locale.toUpperCase()}</Text>)}</View>
        <Text style={styles.muted}>Currency: {currency}</Text>
      </View>
      <SupportButton />
      <Button variant="secondary" onPress={() => void clearSession()}>Log out</Button>
    </ScrollView>
  );
}

function SupportButton() {
  const t = useLocaleStore((state) => state.t);
  return (
    <Pressable accessibilityRole="button" style={styles.supportBtn} onPress={() => router.push("/support/chat")}>
      <MessageCircle size={18} color={Colors.brand} />
      <Text style={styles.supportBtnText}>{t("support.contactUs")}</Text>
      <View style={styles.supportBadge}>
        <Text style={styles.supportBadgeText}>{t("support.responseTime")}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, gap: Spacing.lg, backgroundColor: Colors.bg, padding: Spacing.lg, paddingTop: 64 },
  center: { flex: 1, gap: Spacing.md, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bg, padding: Spacing.lg },
  title: { ...Typography.headingLarge, color: Colors.text },
  muted: { ...Typography.body, color: Colors.muted },
  card: { gap: Spacing.md, borderColor: Colors.line, borderRadius: Radii.lg, borderWidth: 1, backgroundColor: Colors.panel, padding: Spacing.md },
  langs: { flexDirection: "row", gap: Spacing.sm },
  chip: { ...Typography.label, overflow: "hidden", borderRadius: Radii.pill, backgroundColor: Colors.panel2, color: Colors.brand2, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  supportBtn: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderColor: Colors.line, borderRadius: Radii.lg, borderWidth: 1, backgroundColor: Colors.panel, padding: Spacing.md },
  supportBtnText: { ...Typography.button, flex: 1, color: Colors.text },
  supportBadge: { borderRadius: Radii.pill, backgroundColor: Colors.panel2, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  supportBadgeText: { ...Typography.bodySmall, color: Colors.brand2 }
});

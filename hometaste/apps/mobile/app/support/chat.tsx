import type { User } from "@hometaste/types";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { apiRequest } from "../../services/api";
import { getSocket } from "../../services/socket";
import { useAuthStore } from "../../store/auth.store";
import { useT } from "../../store/locale.store";

interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

interface TicketResponse {
  ticket: {
    id: string;
    messages: SupportMessage[];
  };
}

interface MessageResponse {
  message: SupportMessage;
}

export default function SupportChatScreen() {
  const t = useT();
  const currentUser = useAuthStore((state) => state.user as User | null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const optimisticIds = useRef(new Set<string>());

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join:support");
    socket.on("support:new_message", (message: SupportMessage) => {
      setMessages((items) => optimisticIds.current.has(message.id) || items.some((item) => item.id === message.id) ? items : [...items, message]);
    });

    async function initSupport(): Promise<void> {
      const data = await apiRequest<TicketResponse>("/api/support/ticket", { auth: true, method: "POST" });
      setTicketId(data.ticket.id);
      setMessages(data.ticket.messages);
    }

    void initSupport();
    return () => {
      socket.off("support:new_message");
    };
  }, []);

  async function sendMessage(): Promise<void> {
    if (!inputText.trim() || !ticketId || !currentUser) return;
    const content = inputText.trim();
    setInputText("");
    const optimisticId = `local-${Date.now()}`;
    optimisticIds.current.add(optimisticId);
    setMessages((items) => [...items, {
      id: optimisticId,
      ticketId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content,
      createdAt: new Date().toISOString()
    }]);
    const response = await apiRequest<MessageResponse>(`/api/support/ticket/${ticketId}/message`, {
      auth: true,
      method: "POST",
      body: JSON.stringify({ content })
    });
    setMessages((items) => items.map((item) => item.id === optimisticId ? response.message : item));
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.logo}><Text style={styles.logoText}>HT</Text></View>
        <Text style={styles.title}>{t("support.title")}</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.closeBtn}>
          <X color={Colors.text} size={20} />
        </Pressable>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SupportBubble message={item} isMine={item.senderId === currentUser?.id} />}
        contentContainerStyle={styles.messages}
      />
      <View style={styles.inputBar}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder={t("support.inputPlaceholder")}
          placeholderTextColor={Colors.soft}
          multiline
          style={styles.input}
        />
        <Pressable accessibilityRole="button" disabled={!inputText.trim()} onPress={() => void sendMessage()} style={[styles.sendBtn, !inputText.trim() ? styles.sendDisabled : null]}>
          <Text style={styles.sendText}>{t("btn.placeOrder").split(" ")[0]}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function SupportBubble({ message, isMine }: { message: SupportMessage; isMine: boolean }) {
  const isSystem = message.senderId === "SYSTEM";
  if (isSystem) {
    return (
      <View style={styles.systemRow}>
        <View style={styles.botAvatar}><Text style={styles.botText}>HT</Text></View>
        <Text style={styles.systemBubble}>{message.content}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.messageRow, isMine ? styles.messageRowMine : null]}>
      <View style={[styles.bubble, isMine ? styles.userBubble : styles.agentBubble]}>
        <Text style={styles.bubbleText}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: { minHeight: 92, flexDirection: "row", alignItems: "flex-end", gap: Spacing.md, borderBottomColor: Colors.line, borderBottomWidth: 1, padding: Spacing.lg },
  logo: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: Radii.pill, backgroundColor: Colors.brand },
  logoText: { ...Typography.label, color: Colors.text },
  title: { ...Typography.headingLarge, flex: 1, color: Colors.text },
  closeBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: Radii.pill, backgroundColor: Colors.panel2 },
  messages: { gap: Spacing.sm, padding: Spacing.lg },
  messageRow: { flexDirection: "row" },
  messageRowMine: { justifyContent: "flex-end" },
  bubble: { maxWidth: "78%", borderRadius: 16, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  userBubble: { borderTopRightRadius: 4, backgroundColor: Colors.brand },
  agentBubble: { borderTopLeftRadius: 4, backgroundColor: Colors.panel2 },
  bubbleText: { ...Typography.body, color: Colors.text },
  systemRow: { flexDirection: "row", alignSelf: "center", alignItems: "center", gap: Spacing.sm, maxWidth: "92%" },
  botAvatar: { width: 24, height: 24, alignItems: "center", justifyContent: "center", borderRadius: Radii.pill, backgroundColor: "#0f766e" },
  botText: { ...Typography.label, color: Colors.text, fontSize: 9 },
  systemBubble: { ...Typography.body, overflow: "hidden", borderRadius: Radii.md, backgroundColor: "rgba(20,184,166,0.22)", color: Colors.text, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: Spacing.sm, borderTopColor: Colors.line, borderTopWidth: 1, backgroundColor: Colors.panel, padding: Spacing.md },
  input: { ...Typography.body, maxHeight: 120, minHeight: 44, flex: 1, borderColor: Colors.line, borderRadius: Radii.md, borderWidth: 1, color: Colors.text, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  sendBtn: { minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: Radii.md, backgroundColor: Colors.brand, paddingHorizontal: Spacing.md },
  sendDisabled: { opacity: 0.5 },
  sendText: { ...Typography.button, color: Colors.text }
});

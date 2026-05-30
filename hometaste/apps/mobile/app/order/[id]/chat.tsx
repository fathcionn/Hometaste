import { MessageType } from "@hometaste/types";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowUp, ChevronLeft, Image as ImageIcon } from "lucide-react-native";
import { MotiView } from "moti";
import { useCallback, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ChatBubble } from "../../../components/chat/ChatBubble";
import { Colors, Radii, Spacing, Typography } from "../../../constants/theme";
import { useChat } from "../../../hooks/useChat";
import { useT } from "../../../store/locale.store";

const quickKeys = ["chat.quick1", "chat.quick2", "chat.quick3", "chat.quick4", "chat.quick5"];

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const [text, setText] = useState("");
  const { messages, otherUserTyping, sendMessage, emitTyping, currentUserId } = useChat(id ?? "");
  const renderItem = useCallback(({ item }: { item: (typeof messages)[number] }) => <ChatBubble message={item} currentUserId={currentUserId} />, [currentUserId]);

  async function send(): Promise<void> {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText("");
    emitTyping(false);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function sendImage(): Promise<void> {
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.75 });
    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset?.uri) sendMessage(asset.uri, MessageType.Image);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><ChevronLeft color={Colors.text} size={22} /></Pressable>
        <View>
          <Text style={styles.title}>{t("chat.title")}</Text>
          <Text style={styles.muted}>● {t("chat.online")} · Avg response: ~10 min</Text>
        </View>
      </View>
      <FlatList data={messages} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={styles.messages} />
      {otherUserTyping ? <TypingIndicator /> : null}
      {!text ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickReplies}>
          {quickKeys.map((key) => <Text key={key} onPress={() => setText(t(key))} style={styles.quick}>{t(key)}</Text>)}
        </ScrollView>
      ) : null}
      <View style={styles.inputBar}>
        <Pressable onPress={() => void sendImage()}><ImageIcon color={Colors.muted} size={22} /></Pressable>
        <TextInput value={text} onChangeText={(value) => { setText(value); emitTyping(value.length > 0); }} multiline placeholder={t("chat.placeholder")} placeholderTextColor={Colors.soft} style={styles.input} />
        <Pressable disabled={!text.trim()} onPress={() => void send()} style={[styles.send, !text.trim() ? styles.sendDisabled : null]}><ArrowUp color={Colors.text} size={18} /></Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function TypingIndicator() {
  return <View style={styles.typing}>{[0, 1, 2].map((index) => <MotiView key={index} from={{ opacity: 0.3, translateY: 0 }} animate={{ opacity: 1, translateY: -4 }} transition={{ type: "timing", duration: 400, loop: true, delay: index * 150 }} style={styles.dot} />)}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: { minHeight: 92, flexDirection: "row", alignItems: "flex-end", gap: Spacing.md, borderBottomColor: Colors.line, borderBottomWidth: 1, padding: Spacing.lg },
  back: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: Radii.pill, backgroundColor: Colors.panel },
  title: { ...Typography.headingLarge, color: Colors.text },
  muted: { ...Typography.bodySmall, color: Colors.muted },
  messages: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  quickReplies: { gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  quick: { ...Typography.bodySmall, overflow: "hidden", borderRadius: Radii.pill, backgroundColor: Colors.panel2, color: Colors.muted, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: Spacing.sm, borderTopColor: Colors.line, borderTopWidth: 1, backgroundColor: Colors.panel, padding: Spacing.md },
  input: { ...Typography.body, maxHeight: 120, flex: 1, borderColor: Colors.line, borderRadius: Radii.md, borderWidth: 1, color: Colors.text, padding: Spacing.md },
  send: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: Radii.pill, backgroundColor: Colors.brand },
  sendDisabled: { backgroundColor: Colors.line },
  typing: { flexDirection: "row", gap: 4, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.muted }
});

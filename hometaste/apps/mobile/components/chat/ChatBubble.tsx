import type { Message } from "@hometaste/types";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";

export interface ChatBubbleProps {
  message: Message;
  currentUserId: string;
  avatarUrl?: string | null;
}

function ChatBubbleBase({ message, currentUserId, avatarUrl }: ChatBubbleProps) {
  const mine = message.senderId === currentUserId;
  if (message.type === "SYSTEM") {
    return <Text style={styles.system}>{message.content} · {time(message.createdAt)}</Text>;
  }
  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowCook]}>
      {!mine ? <Image source={avatarUrl ? { uri: avatarUrl } : undefined} style={styles.avatar} /> : null}
      <View>
        <View style={[styles.bubble, mine ? styles.mine : styles.cook]}>
          {message.type === "IMAGE" ? <Image source={{ uri: message.content }} style={styles.image} contentFit="cover" /> : <Text style={mine ? styles.mineText : styles.cookText}>{message.content}</Text>}
        </View>
        <Text style={[styles.time, mine ? styles.timeMine : styles.timeCook]}>{time(message.createdAt)} {mine ? (message.readAt ? "✓✓" : "✓") : ""}</Text>
      </View>
    </View>
  );
}

export const ChatBubble = memo(ChatBubbleBase);

function time(value: string): string {
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: Spacing.sm, marginVertical: Spacing.xs },
  rowMine: { justifyContent: "flex-end" },
  rowCook: { justifyContent: "flex-start" },
  avatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.panel2, alignSelf: "flex-end" },
  bubble: { maxWidth: 260, borderRadius: 16, padding: Spacing.md },
  mine: { borderTopRightRadius: 4, backgroundColor: Colors.brand },
  cook: { borderTopLeftRadius: 4, backgroundColor: Colors.panel2 },
  mineText: { ...Typography.body, color: Colors.text },
  cookText: { ...Typography.body, color: Colors.text },
  image: { width: 200, height: 150, borderRadius: Radii.md },
  time: { ...Typography.bodySmall, color: Colors.muted, marginTop: 2 },
  timeMine: { textAlign: "right" },
  timeCook: { textAlign: "left" },
  system: { ...Typography.bodySmall, color: Colors.muted, fontStyle: "italic", textAlign: "center", marginVertical: Spacing.sm }
});

import { MessageType, type Message } from "@hometaste/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { getSocket } from "../services/socket";
import { useAuthStore } from "../store/auth.store";

interface MessagesResponse {
  messages: Message[];
}

export function useChat(orderId: string) {
  const currentUser = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const query = useQuery<MessagesResponse, Error>({
    queryKey: ["messages", orderId],
    queryFn: () => apiRequest<MessagesResponse>(`/api/orders/${orderId}/messages`, { auth: true }),
    enabled: Boolean(orderId)
  });

  useEffect(() => {
    setMessages(query.data?.messages ?? []);
  }, [query.data]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join:order", orderId);
    socket.on("chat:new_message", (message: Message) => setMessages((items) => [...items, message]));
    socket.on("chat:typing", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      if (userId !== currentUser?.id) setOtherUserTyping(isTyping);
    });

    return () => {
      socket.emit("leave:order", orderId);
      socket.off("chat:new_message");
      socket.off("chat:typing");
    };
  }, [currentUser?.id, orderId]);

  function sendMessage(content: string, type: MessageType = MessageType.Text): void {
    const optimistic: Message = {
      id: `${Date.now()}`,
      orderId,
      senderId: currentUser?.id ?? "me",
      content,
      type,
      readAt: null,
      createdAt: new Date().toISOString()
    };
    setMessages((items) => [...items, optimistic]);
    getSocket().emit("chat:send_message", { orderId, content, type });
  }

  function emitTyping(isTyping: boolean): void {
    getSocket().emit("chat:typing", { orderId, isTyping });
  }

  return { messages, otherUserTyping, sendMessage, emitTyping, currentUserId: currentUser?.id ?? "me" };
}

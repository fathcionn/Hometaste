import type { Server, Socket } from "socket.io";
import { MessageType } from "@prisma/client";
import { prisma } from "../config/database.js";
import { createMessage } from "../services/message.service.js";

export interface ChatMessageEvent {
  orderId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

/**
 * Registers real-time chat events for an authenticated socket connection.
 */
export function registerChatHandlers(io: Server, socket: Socket): void {
  socket.on("chat:join", async (orderId: string) => {
    if (!(await canAccessOrder(socket, orderId))) return;
    socket.join(orderRoom(orderId));
  });

  socket.on("chat:leave", (orderId: string) => {
    socket.leave(orderRoom(orderId));
  });

  socket.on("chat:message", (message: ChatMessageEvent) => {
    io.to(orderRoom(message.orderId)).emit("chat:message", message);
  });
  socket.on("chat:send_message", async (data: { orderId: string; content: string; type?: MessageType }) => {
    const senderId = socket.data.userId as string | undefined;
    if (!senderId) return;
    if (!(await canAccessOrder(socket, data.orderId))) return;
    const message = await createMessage(data.orderId, senderId, { content: data.content, type: data.type ?? MessageType.TEXT });
    io.to(orderRoom(data.orderId)).emit("chat:new_message", message);
  });
  socket.on("chat:typing", async (data: { orderId: string; isTyping: boolean }) => {
    if (!(await canAccessOrder(socket, data.orderId))) return;
    socket.to(orderRoom(data.orderId)).emit("chat:typing", {
      userId: socket.data.userId,
      isTyping: data.isTyping
    });
  });
}

export function orderRoom(orderId: string): string {
  return `order:${orderId}`;
}

async function canAccessOrder(socket: Socket, orderId: string): Promise<boolean> {
  const userId = socket.data.userId as string | undefined;
  if (!userId) {
    socket.emit("error", { message: "Not authenticated" });
    return false;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { customerId: true, cook: { select: { userId: true } } }
  });

  if (!order) {
    socket.emit("error", { message: "Order not found" });
    return false;
  }

  if (order.customerId !== userId && order.cook.userId !== userId) {
    socket.emit("error", { message: "Not authorized for this order" });
    return false;
  }

  return true;
}

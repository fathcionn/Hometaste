import type { Server, Socket } from "socket.io";
import { prisma } from "../config/database.js";
import { orderRoom } from "./chat.handler.js";

export interface OrderStatusEvent {
  orderId: string;
  status: string;
  note?: string;
  createdAt: string;
}

/**
 * Registers real-time order status events for an authenticated socket connection.
 */
export function registerOrderHandlers(io: Server, socket: Socket): void {
  socket.on("order:status", (event: OrderStatusEvent) => {
    io.to(orderRoom(event.orderId)).emit("order:status", event);
    io.to(orderRoom(event.orderId)).emit("order:status_updated", {
      orderId: event.orderId,
      status: event.status,
      timestamp: event.createdAt
    });
  });
  socket.on("join:order", async (orderId: string) => {
    const userId = socket.data.userId as string | undefined;
    if (!userId) return socket.emit("error", { message: "Not authenticated" });
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true, cook: { select: { userId: true } } }
    });

    if (!order) return socket.emit("error", { message: "Order not found" });
    if (order.customerId !== userId && order.cook.userId !== userId) {
      return socket.emit("error", { message: "Not authorized for this order" });
    }

    socket.join(orderRoom(orderId));
  });
  socket.on("leave:order", (orderId: string) => {
    socket.leave(orderRoom(orderId));
  });
}

import type { OrderStatus } from "@prisma/client";
import type { Server } from "socket.io";
import { orderRoom } from "./chat.handler.js";

let io: Server | null = null;

/**
 * Stores the active Socket.io server so service-layer events can fan out.
 */
export function setSocketServer(server: Server): void {
  io = server;
}

/**
 * Emits a status update to everyone watching an order.
 */
export function emitOrderStatusUpdated(orderId: string, status: OrderStatus, timestamp = new Date().toISOString()): void {
  io?.to(orderRoom(orderId)).emit("order:status_updated", { orderId, status, timestamp });
}

/**
 * Returns the active Socket.io server for service-layer realtime events.
 */
export function getIO(): Server | null {
  return io;
}

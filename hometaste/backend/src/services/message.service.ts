import { MessageType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/database.js";

export const createMessageSchema = z.object({
  content: z.string().min(1),
  type: z.nativeEnum(MessageType).default(MessageType.TEXT)
});

/**
 * Lists messages for an order in chronological order.
 */
export async function listMessages(orderId: string) {
  return prisma.message.findMany({
    where: { orderId },
    include: { sender: true },
    orderBy: { createdAt: "asc" }
  });
}

/**
 * Creates a persisted order chat message.
 */
export async function createMessage(orderId: string, senderId: string, input: z.infer<typeof createMessageSchema>) {
  return prisma.message.create({
    data: {
      orderId,
      senderId,
      content: input.content,
      type: input.type
    },
    include: { sender: true }
  });
}

/**
 * Marks all unread messages for an order as read.
 */
export async function markOrderMessagesRead(orderId: string, readerId: string) {
  await prisma.message.updateMany({
    where: { orderId, senderId: { not: readerId }, readAt: null },
    data: { readAt: new Date() }
  });
}

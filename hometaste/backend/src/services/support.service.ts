import { TicketStatus, type SupportMessage, type SupportTicket } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";
import { getIO } from "../realtime/bus.js";

const GREETING_DELAY_MS = 800;
const HANDOFF_DELAY_MS = 3500;

export const sendSupportMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000)
});

export type SupportTicketWithMessages = SupportTicket & { messages: SupportMessage[] };

/**
 * Opens or resumes a customer's active support ticket.
 */
export async function openSupportTicket(userId: string, userName: string): Promise<SupportTicketWithMessages> {
  const existing = await prisma.supportTicket.findFirst({
    where: { userId, status: { in: [TicketStatus.OPEN, TicketStatus.WAITING_FOR_AGENT] } },
    include: { messages: { orderBy: { createdAt: "asc" } } }
  });
  if (existing) return existing;

  const firstName = userName.trim().split(/\s+/)[0] || "there";
  const ticket = await prisma.supportTicket.create({
    data: {
      userId,
      status: TicketStatus.OPEN,
      messages: {
        create: [{
          senderId: "SYSTEM",
          senderName: "HomeTaste Support",
          content: `Hello ${firstName}! 👋`
        }]
      }
    },
    include: { messages: { orderBy: { createdAt: "asc" } } }
  });

  void scheduleAutoMessages(ticket.id, userId);
  return ticket;
}

/**
 * Saves a support chat message and emits it to the customer and admin support rooms.
 */
export async function sendSupportMessage(ticketId: string, senderId: string, senderName: string, content: string): Promise<SupportMessage> {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { userId: true, status: true }
  });
  if (!ticket) throw new AppError(404, "Ticket not found");
  if (senderId !== ticket.userId && senderId !== "AGENT") throw new AppError(403, "You cannot message this support ticket");

  const message = await prisma.supportMessage.create({
    data: { ticketId, senderId, senderName, content }
  });

  const msgCount = await prisma.supportMessage.count({
    where: { ticketId, senderId: { not: "SYSTEM" } }
  });
  if (msgCount === 1) void scheduleHandoffMessage(ticketId, ticket.userId);

  getIO()?.to(`support:${ticket.userId}`).emit("support:new_message", message);
  getIO()?.to("admin:support").emit("support:customer_message", {
    ticketId,
    userId: ticket.userId,
    senderName,
    preview: content.slice(0, 80)
  });

  return message;
}

/**
 * Returns support ticket messages when the requester owns the ticket.
 */
export async function listSupportMessages(ticketId: string, userId: string): Promise<SupportMessage[]> {
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId }, select: { userId: true } });
  if (!ticket) throw new AppError(404, "Ticket not found");
  if (ticket.userId !== userId) throw new AppError(403, "You cannot access this support ticket");
  return prisma.supportMessage.findMany({ where: { ticketId }, orderBy: { createdAt: "asc" } });
}

async function scheduleAutoMessages(ticketId: string, userId: string): Promise<void> {
  await delay(GREETING_DELAY_MS);
  const helpMsg = await prisma.supportMessage.create({
    data: {
      ticketId,
      senderId: "SYSTEM",
      senderName: "HomeTaste Support",
      content: "How can I help you today? 😊"
    }
  });
  getIO()?.to(`support:${userId}`).emit("support:new_message", helpMsg);
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: TicketStatus.WAITING_FOR_AGENT }
  });
}

async function scheduleHandoffMessage(ticketId: string, userId: string): Promise<void> {
  await delay(HANDOFF_DELAY_MS);
  const handoffMsg = await prisma.supportMessage.create({
    data: {
      ticketId,
      senderId: "SYSTEM",
      senderName: "HomeTaste Support",
      content: "Thank you! A customer service agent will contact you in just a few seconds. 🙏"
    }
  });
  getIO()?.to(`support:${userId}`).emit("support:new_message", handoffMsg);
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: TicketStatus.WAITING_FOR_AGENT }
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import { OrderStatus, RefundReason } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

const REFUND_WINDOW_MS = 24 * 60 * 60 * 1000;

export const createRefundRequestSchema = z.object({
  reason: z.nativeEnum(RefundReason),
  description: z.string().max(1000).optional()
});

/**
 * Creates a customer refund request for a recently delivered order.
 */
export async function createRefundRequest(orderId: string, customerId: string, input: z.infer<typeof createRefundRequestSchema>) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, "Order not found");
  if (order.customerId !== customerId) throw new AppError(403, "You can only request refunds for your own orders");
  if (order.status !== OrderStatus.DELIVERED) throw new AppError(400, "Refunds are only available after delivery");
  if (Date.now() - order.updatedAt.getTime() > REFUND_WINDOW_MS) throw new AppError(400, "Refund window has expired");

  return prisma.refundRequest.create({
    data: {
      orderId,
      customerId,
      reason: input.reason,
      ...(input.description ? { description: input.description } : {})
    }
  });
}

/**
 * Lists refund requests for an order owned by the authenticated customer.
 */
export async function listRefundRequests(orderId: string, customerId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { customerId: true } });
  if (!order) throw new AppError(404, "Order not found");
  if (order.customerId !== customerId) throw new AppError(403, "You can only view refunds for your own orders");
  return prisma.refundRequest.findMany({ where: { orderId }, orderBy: { createdAt: "desc" } });
}

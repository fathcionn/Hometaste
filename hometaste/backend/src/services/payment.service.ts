import { PaymentStatus } from "@prisma/client";
import Stripe from "stripe";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { stripe } from "../config/stripe.js";
import { AppError } from "../middleware/errorHandler.js";

export const paymentIntentSchema = z.object({
  orderId: z.string().min(1)
});

export const confirmPaymentSchema = z.object({
  orderId: z.string().min(1),
  providerPaymentId: z.string().min(1)
});

/**
 * Creates a Stripe PaymentIntent client secret for an existing order.
 */
export async function createPaymentIntent(orderId: string) {
  if (!stripe) throw new AppError(503, "Stripe is not configured");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, "Order not found");

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100),
    currency: order.currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata: { orderId: order.id }
  });

  return { clientSecret: intent.client_secret, providerPaymentId: intent.id };
}

/**
 * Records a client-confirmed payment identifier while webhook finalization is pending.
 */
export async function confirmPayment(orderId: string, providerPaymentId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, "Order not found");

  return {
    orderId,
    providerPaymentId,
    paymentStatus: order.paymentStatus
  };
}

/**
 * Handles Stripe webhook events and updates payment status from Stripe's source of truth.
 */
export async function handleStripeWebhook(rawBody: Buffer, signature?: string) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) throw new AppError(503, "Stripe webhook is not configured");
  if (!signature) throw new AppError(400, "Missing Stripe signature");

  const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);

  if (event.type === "payment_intent.succeeded") {
    await updateOrderPaymentStatus(event.data.object, PaymentStatus.PAID);
  }

  if (event.type === "payment_intent.payment_failed") {
    await updateOrderPaymentStatus(event.data.object, PaymentStatus.FAILED);
  }

  return { received: true };
}

/**
 * Placeholder seam for the Turkey-specific iyzico integration.
 */
export async function createIyzicoPayment(orderId: string) {
  if (!env.IYZICO_API_KEY || !env.IYZICO_SECRET_KEY) {
    throw new AppError(503, "iyzico is not configured");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, "Order not found");

  return { orderId: order.id, provider: "iyzico", status: "requires_provider_sdk" };
}

async function updateOrderPaymentStatus(intent: Stripe.PaymentIntent, paymentStatus: PaymentStatus) {
  const orderId = intent.metadata.orderId;
  if (!orderId) return;
  await prisma.order.update({ where: { id: orderId }, data: { paymentStatus } });
}

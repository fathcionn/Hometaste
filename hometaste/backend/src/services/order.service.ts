import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";
import { emitOrderStatusUpdated } from "../realtime/bus.js";

export const createOrderSchema = z.object({
  cookId: z.string().min(1),
  deliveryAddress: z.string().min(5),
  customerNote: z.string().optional(),
  paymentMethod: z.string().min(2),
  currency: z.string().length(3).default("TRY"),
  items: z.array(z.object({
    dishId: z.string().min(1),
    quantity: z.number().int().positive(),
    extras: z.array(z.object({ id: z.string(), name: z.string(), price: z.number() })).default([]),
    note: z.string().optional()
  })).min(1)
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().optional()
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(3)
});

/**
 * Lists visible orders for a customer, cook, or admin.
 */
export async function listOrders(userId: string, role: "CUSTOMER" | "COOK" | "ADMIN") {
  if (role === "ADMIN") return prisma.order.findMany({ include: orderInclude, orderBy: { createdAt: "desc" } });
  if (role === "COOK") {
    const cook = await prisma.cook.findUnique({ where: { userId } });
    return prisma.order.findMany({ where: { cookId: cook?.id ?? "__none__" }, include: orderInclude, orderBy: { createdAt: "desc" } });
  }
  return prisma.order.findMany({ where: { customerId: userId }, include: orderInclude, orderBy: { createdAt: "desc" } });
}

/**
 * Returns one order if the authenticated user can access it.
 */
export async function getOrder(id: string, userId: string, role: "CUSTOMER" | "COOK" | "ADMIN") {
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  if (!order) throw new AppError(404, "Order not found");
  await assertOrderAccess(order.cookId, order.customerId, userId, role);
  return order;
}

/**
 * Places an order and creates initial status history.
 */
export async function createOrder(customerId: string, input: z.infer<typeof createOrderSchema>) {
  const dishes = await prisma.dish.findMany({
    where: { id: { in: input.items.map((item) => item.dishId) }, isAvailable: true },
    include: { sauces: true, drinks: true }
  });
  if (dishes.length !== input.items.length) throw new AppError(400, "One or more dishes are unavailable");
  if (dishes.some((dish) => dish.cookId !== input.cookId)) throw new AppError(400, "Order items must belong to one cook");

  const subtotal = input.items.reduce((sum, item) => {
    const dish = dishes.find((entry) => entry.id === item.dishId)!;
    assertExtrasBelongToDish(dish, item.extras);
    const extrasTotal = item.extras.reduce((extraSum, extra) => extraSum + findDishExtra(dish, extra.id).price, 0);
    return sum + (dish.basePrice + extrasTotal) * item.quantity;
  }, 0);
  const deliveryFee = 30;
  const serviceFee = 15;

  return prisma.order.create({
    data: {
      customerId,
      cookId: input.cookId,
      deliveryAddress: input.deliveryAddress,
      paymentMethod: input.paymentMethod,
      currency: input.currency,
      deliveryFee,
      serviceFee,
      totalAmount: subtotal + deliveryFee + serviceFee,
      ...(input.customerNote ? { customerNote: input.customerNote } : {}),
      items: {
        create: input.items.map((item) => {
          const dish = dishes.find((entry) => entry.id === item.dishId)!;
          assertExtrasBelongToDish(dish, item.extras);
          return {
            dish: { connect: { id: dish.id } },
            quantity: item.quantity,
            unitPrice: dish.basePrice,
            extras: item.extras.map((extra) => {
              const storedExtra = findDishExtra(dish, extra.id);
              return { id: storedExtra.id, name: storedExtra.name, price: storedExtra.price };
            }),
            ...(item.note ? { note: item.note } : {})
          };
        })
      },
      statusHistory: { create: { status: OrderStatus.PLACED } }
    },
    include: orderInclude
  });
}

/**
 * Rejects client-submitted extras that are not attached to the ordered dish.
 */
export function assertExtrasBelongToDish(
  dish: DishWithExtras,
  extras: Array<{ id: string }>
): void {
  const validExtraIds = new Set([
    ...dish.sauces.map((sauce) => sauce.id),
    ...dish.drinks.map((drink) => drink.id)
  ]);

  for (const extra of extras) {
    if (!validExtraIds.has(extra.id)) {
      throw new AppError(400, `Extra "${extra.id}" does not belong to dish "${dish.id}"`);
    }
  }
}

type DishWithExtras = { id: string; sauces: Array<{ id: string; name: string; price: number }>; drinks: Array<{ id: string; name: string; price: number }> };

function findDishExtra(dish: DishWithExtras, extraId: string): { id: string; name: string; price: number } {
  const extra = [...dish.sauces, ...dish.drinks].find((entry) => entry.id === extraId);
  if (!extra) throw new AppError(400, `Extra "${extraId}" does not belong to dish "${dish.id}"`);
  return extra;
}

/**
 * Updates order status for a cook/admin and records status history.
 */
export async function updateOrderStatus(id: string, userId: string, role: "CUSTOMER" | "COOK" | "ADMIN", input: z.infer<typeof updateOrderStatusSchema>) {
  const order = await getOrder(id, userId, role);
  if (role === "CUSTOMER") throw new AppError(403, "Customers cannot update order status");
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: input.status,
      statusHistory: { create: { status: input.status, ...(input.note ? { note: input.note } : {}) } }
    },
    include: orderInclude
  });
  emitOrderStatusUpdated(id, input.status);
  return updated;
}

/**
 * Cancels an order when the authenticated user has order access.
 */
export async function cancelOrder(id: string, userId: string, role: "CUSTOMER" | "COOK" | "ADMIN", reason: string) {
  const order = await getOrder(id, userId, role);
  if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
    throw new AppError(400, "Order can no longer be cancelled");
  }
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: OrderStatus.CANCELLED,
      cancelReason: reason,
      statusHistory: { create: { status: OrderStatus.CANCELLED, note: reason } }
    },
    include: orderInclude
  });
  emitOrderStatusUpdated(id, OrderStatus.CANCELLED);
  return updated;
}

const orderInclude = {
  items: { include: { dish: true } },
  cook: { include: { user: true } },
  customer: true,
  statusHistory: true
} as const;

async function assertOrderAccess(cookId: string, customerId: string, userId: string, role: "CUSTOMER" | "COOK" | "ADMIN") {
  if (role === "ADMIN" || customerId === userId) return;
  const cook = await prisma.cook.findUnique({ where: { userId } });
  if (cook?.id === cookId) return;
  throw new AppError(403, "You cannot access this order");
}

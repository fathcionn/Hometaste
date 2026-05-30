import { z } from "zod";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

export const createReviewSchema = z.object({
  ratingOverall: z.number().int().min(1).max(5),
  ratingFood: z.number().int().min(1).max(5),
  ratingSpeed: z.number().int().min(1).max(5),
  ratingPackaging: z.number().int().min(1).max(5),
  ratingComm: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  photoUrl: z.string().url().optional()
});

/**
 * Creates a review for a delivered order and refreshes cook averages.
 */
export async function createReview(orderId: string, customerId: string, input: z.infer<typeof createReviewSchema>) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError(404, "Order not found");
  if (order.customerId !== customerId) throw new AppError(403, "You can only review your own orders");
  const review = await prisma.review.create({
    data: {
      orderId,
      customerId,
      cookId: order.cookId,
      ratingOverall: input.ratingOverall,
      ratingFood: input.ratingFood,
      ratingSpeed: input.ratingSpeed,
      ratingPackaging: input.ratingPackaging,
      ratingComm: input.ratingComm,
      ...(input.comment ? { comment: input.comment } : {}),
      ...(input.photoUrl ? { photoUrl: input.photoUrl } : {})
    }
  });
  await recalculateCookRatings(order.cookId);
  return review;
}

/**
 * Lists reviews for a cook profile.
 */
export async function listCookReviews(cookId: string) {
  return prisma.review.findMany({ where: { cookId }, orderBy: { createdAt: "desc" } });
}

/**
 * Recalculates rating aggregates for a cook.
 */
export async function recalculateCookRatings(cookId: string) {
  const reviews = await prisma.review.findMany({ where: { cookId } });
  if (reviews.length === 0) return;
  const avg = (field: "ratingOverall" | "ratingFood" | "ratingSpeed" | "ratingPackaging" | "ratingComm") =>
    reviews.reduce((sum, review) => sum + review[field], 0) / reviews.length;
  await prisma.cook.update({
    where: { id: cookId },
    data: {
      avgRatingOverall: avg("ratingOverall"),
      avgRatingFood: avg("ratingFood"),
      avgRatingSpeed: avg("ratingSpeed"),
      avgRatingPackaging: avg("ratingPackaging"),
      avgRatingComm: avg("ratingComm")
    }
  });
}

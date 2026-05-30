import { Prisma, SpiceLevel } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

export const createDishSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  imageVerified: z.boolean().default(false),
  cuisine: z.string().min(2),
  ingredients: z.array(z.string().min(1)).default([]),
  spiceLevel: z.nativeEnum(SpiceLevel).default(SpiceLevel.NONE),
  prepTime: z.number().int().positive(),
  basePrice: z.number().positive(),
  tags: z.array(z.string()).default([])
});

export const updateDishSchema = createDishSchema.partial().extend({
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional()
});

export const dishListQuerySchema = z.object({
  featured: z.coerce.boolean().optional(),
  cuisine: z.string().optional(),
  city: z.string().optional(),
  q: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxPrepTime: z.coerce.number().int().positive().optional(),
  available: z.coerce.boolean().optional(),
  availableNow: z.coerce.boolean().optional(),
  halalOnly: z.coerce.boolean().optional(),
  vegan: z.coerce.boolean().optional(),
  spicy: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  sortBy: z.enum(["rating", "price_asc", "price_desc", "newest", "popular"]).default("newest")
});

/**
 * Lists dishes with pagination, sorting, and marketplace filters.
 */
export async function listDishes(query: z.infer<typeof dishListQuerySchema>) {
  const page = query.page;
  const limit = query.limit;
  const search = query.search ?? query.q;
  const cuisines = splitCsv(query.cuisine);
  const tags = [
    ...(query.halalOnly ? ["halal"] : []),
    ...(query.vegan ? ["vegan"] : []),
    ...(query.spicy ? ["spicy", "hot", "very_hot"] : [])
  ];
  const where: Prisma.DishWhereInput = {
    isAvailable: query.available ?? true,
    ...(query.featured !== undefined ? { isFeatured: query.featured } : {}),
    ...(cuisines.length > 0 ? { cuisine: { in: cuisines, mode: "insensitive" } } : {}),
    ...priceWhere(query.minPrice, query.maxPrice),
    ...(query.maxPrepTime ? { prepTime: { lte: query.maxPrepTime } } : {}),
    ...(tags.length > 0 ? { tags: { hasSome: tags } } : {}),
    ...(query.city || query.minRating || query.availableNow
      ? {
          cook: {
            ...(query.city ? { currentCity: { equals: query.city, mode: "insensitive" } } : {}),
            ...(query.minRating ? { avgRatingOverall: { gte: query.minRating } } : {}),
            ...(query.availableNow ? { isActive: true } : {})
          }
        }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { tags: { hasSome: [search.toLowerCase()] } }
          ]
        }
      : {})
  };
  const orderBy = dishOrderBy(query.sortBy);
  const [dishes, total] = await prisma.$transaction([
    prisma.dish.findMany({
      where,
      include: { cook: { include: { user: true } }, sauces: true, drinks: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.dish.count({ where })
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    dishes,
    total,
    page,
    totalPages,
    nextPage: page < totalPages ? page + 1 : null
  };
}

function splitCsv(value: string | undefined): string[] {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function priceWhere(minPrice: number | undefined, maxPrice: number | undefined): Prisma.DishWhereInput {
  if (minPrice === undefined && maxPrice === undefined) return {};
  return {
    basePrice: {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {})
    }
  };
}

function dishOrderBy(sortBy: z.infer<typeof dishListQuerySchema>["sortBy"]): Prisma.DishOrderByWithRelationInput[] {
  const newest = { createdAt: "desc" } satisfies Prisma.DishOrderByWithRelationInput;
  if (sortBy === "price_asc") return [{ basePrice: "asc" }, newest];
  if (sortBy === "price_desc") return [{ basePrice: "desc" }, newest];
  if (sortBy === "rating") return [{ cook: { avgRatingOverall: "desc" } }, newest];
  if (sortBy === "popular") return [{ cook: { totalOrders: "desc" } }, newest];
  return [{ isFeatured: "desc" }, newest];
}

/**
 * Returns one dish detail with cook and extras.
 */
export async function getDish(id: string) {
  const dish = await prisma.dish.findUnique({
    where: { id },
    include: { cook: { include: { user: true } }, sauces: true, drinks: true }
  });
  if (!dish) throw new AppError(404, "Dish not found");
  return dish;
}

/**
 * Creates a dish for the authenticated cook.
 */
export async function createDish(userId: string, input: z.infer<typeof createDishSchema>) {
  const cook = await prisma.cook.findUnique({ where: { userId } });
  if (!cook) throw new AppError(403, "Only cooks can create dishes");
  return prisma.dish.create({
    data: {
      cookId: cook.id,
      name: input.name,
      cuisine: input.cuisine,
      imageVerified: input.imageVerified,
      ingredients: input.ingredients,
      spiceLevel: input.spiceLevel,
      prepTime: input.prepTime,
      basePrice: input.basePrice,
      tags: input.tags,
      ...(input.description ? { description: input.description } : {}),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {})
    }
  });
}

/**
 * Updates a dish owned by the authenticated cook.
 */
export async function updateDish(id: string, userId: string, input: z.infer<typeof updateDishSchema>) {
  const dish = await prisma.dish.findUnique({ where: { id }, include: { cook: true } });
  if (!dish) throw new AppError(404, "Dish not found");
  if (dish.cook.userId !== userId) throw new AppError(403, "You can only update your own dishes");
  const data = removeUndefined(input) as Prisma.DishUncheckedUpdateInput;
  return prisma.dish.update({ where: { id }, data });
}

/**
 * Deletes a dish owned by the authenticated cook.
 */
export async function deleteDish(id: string, userId: string) {
  const dish = await prisma.dish.findUnique({ where: { id }, include: { cook: true } });
  if (!dish) throw new AppError(404, "Dish not found");
  if (dish.cook.userId !== userId) throw new AppError(403, "You can only delete your own dishes");
  await prisma.dish.delete({ where: { id } });
}

function removeUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

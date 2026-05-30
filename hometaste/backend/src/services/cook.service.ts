import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

export const createCookSchema = z.object({
  originCountry: z.string().min(2),
  currentCity: z.string().min(2),
  bio: z.string().max(500).optional(),
  cuisines: z.array(z.string().min(2)).min(1),
  specialties: z.array(z.string().min(2)).default([]),
  availability: z.string().optional(),
  prepTime: z.string().optional()
});

export const updateCookSchema = createCookSchema.partial();

export const updateCookLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  city: z.string().optional(),
  area: z.string().optional()
});

export const cookListQuerySchema = z.object({
  featured: z.coerce.boolean().optional(),
  city: z.string().optional(),
  cuisine: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  available: z.coerce.boolean().optional(),
  availableNow: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  sortBy: z.enum(["rating", "orders", "newest"]).default("rating")
});

/**
 * Lists active cooks with pagination, sorting, and marketplace filters.
 */
export async function listCooks(query: z.infer<typeof cookListQuerySchema>) {
  const page = query.page;
  const limit = query.limit;
  const cuisines = splitCsv(query.cuisine);
  const and: Prisma.CookWhereInput[] = [];
  if (query.featured) and.push({ OR: [{ isVerified: true }, { totalOrders: { gte: 1 } }, { avgRatingOverall: { gte: 4 } }] });
  if (query.search) {
    and.push({
      OR: [
        { currentCity: { contains: query.search, mode: "insensitive" } },
        { bio: { contains: query.search, mode: "insensitive" } },
        { cuisines: { hasSome: [query.search] } },
        { specialties: { hasSome: [query.search] } },
        { user: { name: { contains: query.search, mode: "insensitive" } } }
      ]
    });
  }
  const where: Prisma.CookWhereInput = {
    isActive: query.available ?? query.availableNow ?? true,
    ...(query.city ? { currentCity: { equals: query.city, mode: "insensitive" } } : {}),
    ...(cuisines.length > 0 ? { cuisines: { hasSome: cuisines } } : {}),
    ...(query.minRating ? { avgRatingOverall: { gte: query.minRating } } : {}),
    ...(and.length > 0 ? { AND: and } : {})
  };
  const [cooks, total] = await prisma.$transaction([
    prisma.cook.findMany({
      where,
      include: { user: true, dishes: { where: { isAvailable: true }, take: 3 } },
      orderBy: cookOrderBy(query.sortBy),
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.cook.count({ where })
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    cooks,
    total,
    page,
    totalPages,
    nextPage: page < totalPages ? page + 1 : null
  };
}

function splitCsv(value: string | undefined): string[] {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function cookOrderBy(sortBy: z.infer<typeof cookListQuerySchema>["sortBy"]): Prisma.CookOrderByWithRelationInput[] {
  const newest = { createdAt: "desc" } satisfies Prisma.CookOrderByWithRelationInput;
  if (sortBy === "orders") return [{ totalOrders: "desc" }, newest];
  if (sortBy === "newest") return [newest];
  return [{ avgRatingOverall: "desc" }, { totalOrders: "desc" }, newest];
}

/**
 * Returns one cook profile with dishes and latest reviews.
 */
export async function getCook(id: string) {
  const cook = await prisma.cook.findUnique({
    where: { id },
    include: { user: true, dishes: true, reviews: { take: 10, orderBy: { createdAt: "desc" } } }
  });
  if (!cook) throw new AppError(404, "Cook not found");
  return cook;
}

/**
 * Creates the authenticated user's cook profile instantly.
 */
export async function becomeCook(userId: string, input: z.infer<typeof createCookSchema>) {
  const existing = await prisma.cook.findUnique({ where: { userId } });
  if (existing) throw new AppError(409, "Cook profile already exists");

  return prisma.$transaction(async (tx) => {
    const cook = await tx.cook.create({
      data: {
        userId,
        originCountry: input.originCountry,
        currentCity: input.currentCity,
        cuisines: input.cuisines,
        specialties: input.specialties,
        ...(input.bio ? { bio: input.bio } : {}),
        ...(input.availability ? { availability: input.availability } : {}),
        ...(input.prepTime ? { prepTime: input.prepTime } : {})
      }
    });
    await tx.user.update({ where: { id: userId }, data: { role: Role.COOK } });
    return cook;
  });
}

/**
 * Updates a cook profile owned by the authenticated cook.
 */
export async function updateCook(id: string, userId: string, input: z.infer<typeof updateCookSchema>) {
  const cook = await prisma.cook.findUnique({ where: { id } });
  if (!cook) throw new AppError(404, "Cook not found");
  if (cook.userId !== userId) throw new AppError(403, "You can only update your own cook profile");
  const data = removeUndefined(input) as Prisma.CookUncheckedUpdateInput;
  return prisma.cook.update({ where: { id }, data });
}

/**
 * Updates the authenticated cook's approximate marketplace location.
 */
export async function updateCookLocation(id: string, userId: string, input: z.infer<typeof updateCookLocationSchema>) {
  const cook = await prisma.cook.findFirst({ where: { id, userId } });
  if (!cook) throw new AppError(403, "Not your profile");

  return prisma.cook.update({
    where: { id },
    data: {
      locationLat: input.lat,
      locationLng: input.lng,
      locationCity: input.city ?? "",
      locationArea: input.area ?? ""
    }
  });
}

function removeUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>;
}

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";

export const studioRouter = Router();

studioRouter.use(requireAuth);

studioRouter.get("/cook/studio/orders", async (req, res, next) => {
  try {
    const cook = await prisma.cook.findUnique({ where: { userId: req.user!.id } });
    if (!cook) throw new AppError(403, "Cook profile required");
    const orders = await prisma.order.findMany({
      where: { cookId: cook.id },
      include: { items: { include: { dish: true } }, customer: true, statusHistory: true },
      orderBy: { createdAt: "desc" }
    });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

studioRouter.post("/cook/studio/online", validate(z.object({ body: z.object({ isActive: z.boolean() }) })), async (req, res, next) => {
  try {
    const cook = await prisma.cook.findUnique({ where: { userId: req.user!.id } });
    if (!cook) throw new AppError(403, "Cook profile required");
    res.json(await prisma.cook.update({ where: { id: cook.id }, data: { isActive: req.body.isActive } }));
  } catch (error) {
    next(error);
  }
});

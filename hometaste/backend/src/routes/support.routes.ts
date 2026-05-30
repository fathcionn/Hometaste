import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as supportService from "../services/support.service.js";

export const supportRouter = Router();

supportRouter.use(requireAuth);

supportRouter.post("/ticket", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { name: true }
    });
    const ticket = await supportService.openSupportTicket(req.user!.id, user?.name ?? "there");
    res.json({ ticket });
  } catch (error) {
    next(error);
  }
});

supportRouter.post(
  "/ticket/:id/message",
  validate(z.object({ params: z.object({ id: z.string() }), body: supportService.sendSupportMessageSchema })),
  async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { name: true }
      });
      const message = await supportService.sendSupportMessage(req.params.id!, req.user!.id, user?.name ?? "Customer", req.body.content);
      res.json({ message });
    } catch (error) {
      next(error);
    }
  }
);

supportRouter.get("/ticket/:id/messages", validate(z.object({ params: z.object({ id: z.string() }) })), async (req, res, next) => {
  try {
    const messages = await supportService.listSupportMessages(req.params.id!, req.user!.id);
    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

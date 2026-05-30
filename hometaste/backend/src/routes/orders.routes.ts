import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as orderService from "../services/order.service.js";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.get("/", async (req, res, next) => {
  try {
    res.json(await orderService.listOrders(req.user!.id, req.user!.role));
  } catch (error) {
    next(error);
  }
});

ordersRouter.get("/:id", validate(z.object({ params: z.object({ id: z.string() }) })), async (req, res, next) => {
  try {
    res.json(await orderService.getOrder(req.params.id!, req.user!.id, req.user!.role));
  } catch (error) {
    next(error);
  }
});

ordersRouter.post("/", validate(z.object({ body: orderService.createOrderSchema })), async (req, res, next) => {
  try {
    res.status(201).json(await orderService.createOrder(req.user!.id, req.body));
  } catch (error) {
    next(error);
  }
});

ordersRouter.patch("/:id/status", validate(z.object({ params: z.object({ id: z.string() }), body: orderService.updateOrderStatusSchema })), async (req, res, next) => {
  try {
    res.json(await orderService.updateOrderStatus(req.params.id!, req.user!.id, req.user!.role, req.body));
  } catch (error) {
    next(error);
  }
});

ordersRouter.post("/:id/cancel", validate(z.object({ params: z.object({ id: z.string() }), body: orderService.cancelOrderSchema })), async (req, res, next) => {
  try {
    res.json(await orderService.cancelOrder(req.params.id!, req.user!.id, req.user!.role, req.body.reason));
  } catch (error) {
    next(error);
  }
});

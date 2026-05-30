import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as refundService from "../services/refund.service.js";

export const refundRouter = Router();

refundRouter.post(
  "/orders/:id/refund",
  requireAuth,
  validate(z.object({ params: z.object({ id: z.string() }), body: refundService.createRefundRequestSchema })),
  async (req, res, next) => {
    try {
      res.status(201).json({ refund: await refundService.createRefundRequest(req.params.id!, req.user!.id, req.body) });
    } catch (error) {
      next(error);
    }
  }
);

refundRouter.get("/orders/:id/refunds", requireAuth, validate(z.object({ params: z.object({ id: z.string() }) })), async (req, res, next) => {
  try {
    res.json({ refunds: await refundService.listRefundRequests(req.params.id!, req.user!.id) });
  } catch (error) {
    next(error);
  }
});

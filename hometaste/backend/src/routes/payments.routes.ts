import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as paymentService from "../services/payment.service.js";

export const paymentsRouter = Router();
export const paymentsWebhookRouter = Router();

paymentsRouter.use(requireAuth);

paymentsRouter.post(
  "/intent",
  validate(z.object({ body: paymentService.paymentIntentSchema })),
  async (req, res, next) => {
    try {
      res.json(await paymentService.createPaymentIntent(req.body.orderId));
    } catch (error) {
      next(error);
    }
  }
);

paymentsRouter.post(
  "/confirm",
  validate(z.object({ body: paymentService.confirmPaymentSchema })),
  async (req, res, next) => {
    try {
      res.json(await paymentService.confirmPayment(req.body.orderId, req.body.providerPaymentId));
    } catch (error) {
      next(error);
    }
  }
);

paymentsWebhookRouter.post("/webhook", async (req, res, next) => {
  try {
    res.json(await paymentService.handleStripeWebhook(req.body, req.header("stripe-signature")));
  } catch (error) {
    next(error);
  }
});

import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as reviewService from "../services/review.service.js";

export const reviewsRouter = Router();

reviewsRouter.post("/orders/:id/review", requireAuth, validate(z.object({ params: z.object({ id: z.string() }), body: reviewService.createReviewSchema })), async (req, res, next) => {
  try {
    res.status(201).json(await reviewService.createReview(req.params.id!, req.user!.id, req.body));
  } catch (error) {
    next(error);
  }
});

reviewsRouter.get("/cooks/:id/reviews", validate(z.object({ params: z.object({ id: z.string() }) })), async (req, res, next) => {
  try {
    res.json({ reviews: await reviewService.listCookReviews(req.params.id!) });
  } catch (error) {
    next(error);
  }
});

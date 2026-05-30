import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { validate } from "../middleware/validate.js";
import * as cookService from "../services/cook.service.js";

export const cooksRouter = Router();

cooksRouter.get("/", validate(z.object({ query: cookService.cookListQuerySchema })), async (req, res, next) => {
  try {
    res.json(await cookService.listCooks(cookService.cookListQuerySchema.parse(req.query)));
  } catch (error) {
    next(error);
  }
});

cooksRouter.get("/:id", validate(z.object({ params: z.object({ id: z.string() }) })), async (req, res, next) => {
  try {
    res.json(await cookService.getCook(req.params.id!));
  } catch (error) {
    next(error);
  }
});

cooksRouter.post("/", requireAuth, validate(z.object({ body: cookService.createCookSchema })), async (req, res, next) => {
  try {
    res.status(201).json(await cookService.becomeCook(req.user!.id, req.body));
  } catch (error) {
    next(error);
  }
});

cooksRouter.patch("/:id", requireAuth, validate(z.object({ params: z.object({ id: z.string() }), body: cookService.updateCookSchema })), async (req, res, next) => {
  try {
    res.json(await cookService.updateCook(req.params.id!, req.user!.id, req.body));
  } catch (error) {
    next(error);
  }
});

cooksRouter.patch(
  "/:id/location",
  requireAuth,
  requireRole("COOK"),
  validate(z.object({ params: z.object({ id: z.string() }), body: cookService.updateCookLocationSchema })),
  async (req, res, next) => {
    try {
      res.json({ cook: await cookService.updateCookLocation(req.params.id!, req.user!.id, req.body) });
    } catch (error) {
      next(error);
    }
  }
);

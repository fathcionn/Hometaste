import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as dishService from "../services/dish.service.js";

export const dishesRouter = Router();

dishesRouter.get("/", validate(z.object({ query: dishService.dishListQuerySchema })), async (req, res, next) => {
  try {
    res.json(await dishService.listDishes(dishService.dishListQuerySchema.parse(req.query)));
  } catch (error) {
    next(error);
  }
});

dishesRouter.get("/:id", validate(z.object({ params: z.object({ id: z.string() }) })), async (req, res, next) => {
  try {
    res.json(await dishService.getDish(req.params.id!));
  } catch (error) {
    next(error);
  }
});

dishesRouter.post("/", requireAuth, validate(z.object({ body: dishService.createDishSchema })), async (req, res, next) => {
  try {
    res.status(201).json(await dishService.createDish(req.user!.id, req.body));
  } catch (error) {
    next(error);
  }
});

dishesRouter.patch("/:id", requireAuth, validate(z.object({ params: z.object({ id: z.string() }), body: dishService.updateDishSchema })), async (req, res, next) => {
  try {
    res.json(await dishService.updateDish(req.params.id!, req.user!.id, req.body));
  } catch (error) {
    next(error);
  }
});

dishesRouter.delete("/:id", requireAuth, validate(z.object({ params: z.object({ id: z.string() }) })), async (req, res, next) => {
  try {
    await dishService.deleteDish(req.params.id!, req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

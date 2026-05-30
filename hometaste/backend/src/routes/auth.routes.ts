import { Router } from "express";
import { z } from "zod";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as authService from "../services/auth.service.js";

export const authRouter = Router();

authRouter.post(
  "/signup",
  authRateLimiter,
  validate(z.object({ body: authService.signupInputSchema })),
  async (req, res, next) => {
    try {
      res.status(201).json(await authService.signup(req.body));
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  "/login",
  authRateLimiter,
  validate(z.object({ body: authService.loginInputSchema })),
  async (req, res, next) => {
    try {
      res.json(await authService.login(req.body));
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  "/refresh",
  authRateLimiter,
  validate(z.object({ body: authService.refreshInputSchema })),
  async (req, res, next) => {
    try {
      res.json(await authService.refresh(req.body.refreshToken));
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  "/logout",
  validate(z.object({ body: authService.refreshInputSchema })),
  async (req, res, next) => {
    try {
      await authService.logout(req.body.refreshToken);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    res.json(await authService.me(req.user!.id));
  } catch (error) {
    next(error);
  }
});

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./errorHandler.js";

export interface AuthenticatedUser {
  id: string;
  role: "CUSTOMER" | "COOK" | "ADMIN";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) return next(new AppError(401, "Authentication required"));

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthenticatedUser;
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch {
    return next(new AppError(401, "Invalid or expired access token"));
  }
}

import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler.js";

/**
 * Restricts a route to one or more authenticated roles.
 */
export function requireRole(...roles: Array<"CUSTOMER" | "COOK" | "ADMIN">) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new AppError(401, "Authentication required"));
    if (!roles.includes(req.user.role)) return next(new AppError(403, "Insufficient permissions"));
    return next();
  };
}

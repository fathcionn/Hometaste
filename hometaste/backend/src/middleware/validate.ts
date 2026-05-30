import type { RequestHandler } from "express";
import type { AnyZodObject } from "zod";

/**
 * Validates request body/query/params with a Zod object before a route handler runs.
 */
export function validate(schema: AnyZodObject): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) return next(result.error);

    req.body = result.data.body ?? req.body;
    req.query = result.data.query ?? req.query;
    req.params = result.data.params ?? req.params;
    return next();
  };
}

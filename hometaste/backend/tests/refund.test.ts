import { RefundReason } from "@prisma/client";
import request from "supertest";
import { app } from "../src/app.js";
import { createRefundRequestSchema } from "../src/services/refund.service.js";

describe("refund routes", () => {
  it("requires authentication to request a refund", async () => {
    const response = await request(app).post("/api/orders/order-1/refund").send({ reason: RefundReason.FOOD_QUALITY });

    expect(response.status).toBe(401);
  });
});

describe("refund request schema", () => {
  it("accepts a known refund reason", () => {
    expect(createRefundRequestSchema.parse({ reason: RefundReason.WRONG_ITEMS, description: "Wrong meal arrived" })).toEqual({
      reason: RefundReason.WRONG_ITEMS,
      description: "Wrong meal arrived"
    });
  });

  it("rejects unknown refund reasons", () => {
    expect(() => createRefundRequestSchema.parse({ reason: "BAD_REASON" })).toThrow();
  });
});

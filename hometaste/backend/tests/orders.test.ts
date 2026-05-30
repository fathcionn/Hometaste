import request from "supertest";
import { app } from "../src/app.js";
import { AppError } from "../src/middleware/errorHandler.js";
import { assertExtrasBelongToDish, cancelOrderSchema, createOrderSchema, updateOrderStatusSchema } from "../src/services/order.service.js";

describe("order extra validation", () => {
  const dish = {
    id: "dish-1",
    sauces: [{ id: "sauce-1", name: "Garlic sauce", price: 5 }],
    drinks: [{ id: "drink-1", name: "Ayran", price: 10 }]
  };

  it("accepts extras that belong to the ordered dish", () => {
    expect(() => assertExtrasBelongToDish(dish, [{ id: "sauce-1" }, { id: "drink-1" }])).not.toThrow();
  });

  it("rejects extras that do not belong to the ordered dish", () => {
    expect(() => assertExtrasBelongToDish(dish, [{ id: "extra-from-different-dish" }])).toThrow(AppError);
    expect(() => assertExtrasBelongToDish(dish, [{ id: "extra-from-different-dish" }])).toThrow(/does not belong/);
  });
});

describe("order route protection", () => {
  it("returns 401 without auth token", async () => {
    const response = await request(app).post("/api/orders").send({});

    expect(response.status).toBe(401);
  });

  it("returns 401 for order details without auth token", async () => {
    const response = await request(app).get("/api/orders/order-1");

    expect(response.status).toBe(401);
  });
});

describe("order request schemas", () => {
  it("accepts a valid create order payload", () => {
    const parsed = createOrderSchema.parse({
      cookId: "cook-1",
      deliveryAddress: "123 Test Street",
      paymentMethod: "Cash",
      currency: "TRY",
      items: [{ dishId: "dish-1", quantity: 2, extras: [], note: "" }]
    });

    expect(parsed.items[0]?.quantity).toBe(2);
  });

  it("rejects orders without items", () => {
    expect(() => createOrderSchema.parse({
      cookId: "cook-1",
      deliveryAddress: "123 Test Street",
      paymentMethod: "Cash",
      currency: "TRY",
      items: []
    })).toThrow();
  });

  it("validates status updates and cancellation reasons", () => {
    expect(updateOrderStatusSchema.parse({ status: "CANCELLED", note: "Customer request" }).status).toBe("CANCELLED");
    expect(() => cancelOrderSchema.parse({ reason: "no" })).toThrow();
  });
});

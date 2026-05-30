import { confirmPaymentSchema, paymentIntentSchema } from "../src/services/payment.service.js";

describe("payment request schemas", () => {
  it("accepts a valid payment intent request", () => {
    expect(paymentIntentSchema.parse({ orderId: "order-1" })).toEqual({ orderId: "order-1" });
  });

  it("rejects a payment intent request without an order id", () => {
    expect(() => paymentIntentSchema.parse({ orderId: "" })).toThrow();
  });

  it("requires provider payment id when confirming payment", () => {
    expect(confirmPaymentSchema.parse({ orderId: "order-1", providerPaymentId: "pi_123" })).toEqual({
      orderId: "order-1",
      providerPaymentId: "pi_123"
    });
    expect(() => confirmPaymentSchema.parse({ orderId: "order-1", providerPaymentId: "" })).toThrow();
  });
});

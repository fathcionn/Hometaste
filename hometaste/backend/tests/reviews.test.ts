import request from "supertest";
import { app } from "../src/app.js";
import { createReviewSchema } from "../src/services/review.service.js";

const validReview = {
  ratingOverall: 5,
  ratingFood: 5,
  ratingSpeed: 4,
  ratingPackaging: 5,
  ratingComm: 4,
  comment: "Warm, quick, and exactly as described"
};

describe("POST /api/orders/:id/review", () => {
  it("requires authentication", async () => {
    const response = await request(app).post("/api/orders/order-1/review").send(validReview);

    expect(response.status).toBe(401);
  });

  it("accepts a complete review payload", () => {
    expect(createReviewSchema.parse(validReview)).toMatchObject(validReview);
  });

  it("rejects rating values below one", () => {
    expect(() => createReviewSchema.parse({ ...validReview, ratingFood: 0 })).toThrow();
  });

  it("rejects rating values above five", () => {
    expect(() => createReviewSchema.parse({ ...validReview, ratingSpeed: 6 })).toThrow();
  });

  it("rejects overly long review comments", () => {
    expect(() => createReviewSchema.parse({ ...validReview, comment: "x".repeat(501) })).toThrow();
  });
});

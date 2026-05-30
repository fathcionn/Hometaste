import request from "supertest";
import { app } from "../src/app.js";
import { updateCookLocationSchema } from "../src/services/cook.service.js";

describe("cook location route", () => {
  it("requires authentication", async () => {
    const response = await request(app).patch("/api/cooks/cook-1/location").send({ lat: 41.01, lng: 28.97 });

    expect(response.status).toBe(401);
  });
});

describe("cook location schema", () => {
  it("accepts approximate location values", () => {
    expect(updateCookLocationSchema.parse({ lat: 41.01, lng: 28.97, city: "Istanbul", area: "Kadikoy" })).toEqual({
      lat: 41.01,
      lng: 28.97,
      city: "Istanbul",
      area: "Kadikoy"
    });
  });

  it("rejects missing coordinates", () => {
    expect(() => updateCookLocationSchema.parse({ city: "Istanbul" })).toThrow();
  });
});

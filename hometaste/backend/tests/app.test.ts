import request from "supertest";
import { app } from "../src/app.js";

describe("app", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "ok", service: "hometaste-api" });
    expect(response.body.timestamp).toEqual(expect.any(String));
  });

  it("validates auth signup body before service execution", async () => {
    const response = await request(app).post("/api/auth/signup").send({ email: "bad" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
  });
});

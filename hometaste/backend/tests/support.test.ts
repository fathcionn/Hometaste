import request from "supertest";
import { app } from "../src/app.js";
import { sendSupportMessageSchema } from "../src/services/support.service.js";

describe("support routes", () => {
  it("requires authentication to open a support ticket", async () => {
    const response = await request(app).post("/api/support/ticket").send({});

    expect(response.status).toBe(401);
  });

  it("requires authentication to send a support message", async () => {
    const response = await request(app).post("/api/support/ticket/ticket-1/message").send({ content: "Help" });

    expect(response.status).toBe(401);
  });
});

describe("support message schema", () => {
  it("accepts a non-empty support message", () => {
    expect(sendSupportMessageSchema.parse({ content: "I need help with my order" })).toEqual({ content: "I need help with my order" });
  });

  it("rejects empty support messages", () => {
    expect(() => sendSupportMessageSchema.parse({ content: "   " })).toThrow();
  });
});

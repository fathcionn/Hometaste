import { MessageType } from "@prisma/client";
import request from "supertest";
import { app } from "../src/app.js";
import { createMessageSchema } from "../src/services/message.service.js";

describe("GET /api/orders/:id/messages", () => {
  it("requires authentication", async () => {
    const response = await request(app).get("/api/orders/order-1/messages");

    expect(response.status).toBe(401);
  });
});

describe("message request schemas", () => {
  it("defaults message type to text", () => {
    const parsed = createMessageSchema.parse({ content: "How long will it take?" });

    expect(parsed.type).toBe(MessageType.TEXT);
  });

  it("accepts image messages", () => {
    const parsed = createMessageSchema.parse({ content: "https://example.com/photo.jpg", type: MessageType.IMAGE });

    expect(parsed.type).toBe(MessageType.IMAGE);
  });

  it("rejects empty content", () => {
    expect(() => createMessageSchema.parse({ content: "" })).toThrow();
  });
});

import { orderRoom } from "../src/realtime/chat.handler.js";

describe("realtime helpers", () => {
  it("builds stable order room names", () => {
    expect(orderRoom("ord_123")).toBe("order:ord_123");
  });
});

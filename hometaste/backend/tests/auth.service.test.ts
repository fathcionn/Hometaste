import jwt from "jsonwebtoken";
import { env } from "../src/config/env.js";
import { createAccessToken } from "../src/services/auth.service.js";

describe("auth service", () => {
  it("creates a signed access token containing user id and role", () => {
    const token = createAccessToken({ id: "usr_123", role: "CUSTOMER" });
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string; role: string };

    expect(payload.id).toBe("usr_123");
    expect(payload.role).toBe("CUSTOMER");
  });
});

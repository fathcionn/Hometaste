import { loginInputSchema, refreshInputSchema, signupInputSchema } from "../src/services/auth.service.js";

describe("auth request schemas", () => {
  it("accepts a valid signup payload", () => {
    const payload = {
      email: "cook@example.com",
      password: "strong-password",
      name: "Test Cook",
      role: "COOK"
    };

    expect(signupInputSchema.parse(payload)).toMatchObject({
      email: payload.email,
      password: payload.password,
      name: payload.name
    });
  });

  it("rejects weak login credentials", () => {
    expect(() => loginInputSchema.parse({ email: "not-an-email", password: "short" })).toThrow();
  });

  it("requires a non-trivial refresh token", () => {
    expect(refreshInputSchema.parse({ refreshToken: "refresh-token-value" })).toEqual({ refreshToken: "refresh-token-value" });
    expect(() => refreshInputSchema.parse({ refreshToken: "tiny" })).toThrow();
  });
});

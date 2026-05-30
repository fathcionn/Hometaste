import { cookListQuerySchema } from "../src/services/cook.service.js";

describe("cook marketplace filters", () => {
  it("parses featured, search, cuisine, rating, and pagination filters", () => {
    const query = cookListQuerySchema.parse({
      featured: "true",
      cuisine: "turkish,syrian",
      city: "Istanbul",
      minRating: "4.5",
      availableNow: "true",
      search: "fatma",
      page: "3",
      limit: "10",
      sortBy: "orders"
    });

    expect(query).toMatchObject({
      featured: true,
      cuisine: "turkish,syrian",
      city: "Istanbul",
      minRating: 4.5,
      availableNow: true,
      search: "fatma",
      page: 3,
      limit: 10,
      sortBy: "orders"
    });
  });

  it("rejects invalid rating and sort inputs", () => {
    expect(() => cookListQuerySchema.parse({ minRating: "8" })).toThrow();
    expect(() => cookListQuerySchema.parse({ sortBy: "distance" })).toThrow();
  });
});

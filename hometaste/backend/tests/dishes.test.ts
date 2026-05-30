import { dishListQuerySchema } from "../src/services/dish.service.js";

describe("dish marketplace filters", () => {
  it("parses pagination, cuisine, pricing, and boolean filters", () => {
    const query = dishListQuerySchema.parse({
      cuisine: "turkish,egyptian",
      minPrice: "10",
      maxPrice: "80",
      minRating: "4",
      maxPrepTime: "45",
      availableNow: "true",
      halalOnly: "true",
      page: "2",
      limit: "12",
      sortBy: "popular",
      search: "koshari"
    });

    expect(query).toMatchObject({
      cuisine: "turkish,egyptian",
      minPrice: 10,
      maxPrice: 80,
      minRating: 4,
      maxPrepTime: 45,
      availableNow: true,
      halalOnly: true,
      page: 2,
      limit: 12,
      sortBy: "popular",
      search: "koshari"
    });
  });

  it("rejects unsupported sort values and oversized page limits", () => {
    expect(() => dishListQuerySchema.parse({ sortBy: "random" })).toThrow();
    expect(() => dishListQuerySchema.parse({ limit: "200" })).toThrow();
  });
});

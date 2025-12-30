import { describe, it, expect } from "vitest";
import { computeStock } from "../src/domain/stock.js";
import { MovementType } from "../src/domain/types.js";

describe("computeStock", () => {
  it("calcula IN/OUT correctamente", () => {
    const products = [{ id: "p1" }, { id: "p2" }];
    const movements = [
      { productId: "p1", type: MovementType.IN, qty: 10 },
      { productId: "p1", type: MovementType.OUT, qty: 3 },
      { productId: "p2", type: MovementType.IN, qty: 5 }
    ];

    const stock = computeStock(products, movements);
    expect(stock.p1).toBe(7);
    expect(stock.p2).toBe(5);
  });

  it("ADJUST setea stock absoluto", () => {
    const products = [{ id: "p1" }];
    const movements = [
      { productId: "p1", type: MovementType.IN, qty: 10 },
      { productId: "p1", type: MovementType.ADJUST, qty: 2 },
      { productId: "p1", type: MovementType.IN, qty: 3 }
    ];

    const stock = computeStock(products, movements);
    expect(stock.p1).toBe(5);
  });
});

import { describe, it, expect } from "vitest";
import { validateProduct, validateMovement } from "../src/domain/validations.js";
import { MovementType } from "../src/domain/types.js";

describe("validateProduct", () => {
  it("requiere campos y SKU único", () => {
    const all = [{ id: "a", sku: "AAA" }];
    const p = { id: "b", name: "", sku: "AAA", category: "", cost: -1, price: -2, minStock: -3 };
    const errors = validateProduct(p, all);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.join(" ")).toContain("SKU");
  });
});

describe("validateMovement", () => {
  it("valida qty según tipo", () => {
    const products = [{ id: "p1" }];
    const m1 = { productId: "p1", type: MovementType.OUT, qty: 0 };
    const m2 = { productId: "p1", type: MovementType.ADJUST, qty: -1 };

    expect(validateMovement(m1, products).length).toBeGreaterThan(0);
    expect(validateMovement(m2, products).length).toBeGreaterThan(0);
  });
});

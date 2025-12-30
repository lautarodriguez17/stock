import { MovementType } from "../domain/types.js";

export function seedProducts() {
  return [
    {
      id: "p_agua_500",
      name: "Agua 500ml",
      sku: "AGUA-500",
      category: "Bebidas",
      cost: 350,
      price: 700,
      minStock: 10,
      active: true
    },
    {
      id: "p_chicle",
      name: "Chicle",
      sku: "CHIC-001",
      category: "Golosinas",
      cost: 80,
      price: 200,
      minStock: 20,
      active: true
    }
  ];
}

export function seedMovements() {
  const now = new Date().toISOString();
  return [
    {
      id: "m1",
      productId: "p_agua_500",
      type: MovementType.IN,
      qty: 30,
      note: "Compra inicial",
      user: "Admin",
      atISO: now
    },
    {
      id: "m2",
      productId: "p_chicle",
      type: MovementType.IN,
      qty: 50,
      note: "Compra inicial",
      user: "Admin",
      atISO: now
    }
  ];
}

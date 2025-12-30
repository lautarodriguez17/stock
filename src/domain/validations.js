import { MovementType } from "./types.js";

export function validateProduct(product, allProducts) {
  const errors = [];

  if (!product.name?.trim()) errors.push("El nombre es requerido.");
  if (!product.sku?.trim()) errors.push("El SKU/código es requerido.");
  if (!product.category?.trim()) errors.push("La categoría es requerida.");

  const cost = Number(product.cost);
  const price = Number(product.price);
  const minStock = Number(product.minStock);

  if (Number.isNaN(cost) || cost < 0) errors.push("Costo inválido (no negativo).");
  if (Number.isNaN(price) || price < 0) errors.push("Precio inválido (no negativo).");
  if (Number.isNaN(minStock) || minStock < 0) errors.push("Stock mínimo inválido (no negativo).");

  // SKU único (considerando activos e inactivos, para no duplicar)
  const sku = product.sku?.trim().toLowerCase();
  const collision = allProducts.some(
    (p) => p.id !== product.id && (p.sku || "").trim().toLowerCase() === sku
  );
  if (collision) errors.push("El SKU ya existe. Debe ser único.");

  return errors;
}

export function validateMovement(movement, products) {
  const errors = [];

  if (!movement.productId) errors.push("Producto requerido.");
  const exists = products.some((p) => p.id === movement.productId);
  if (!exists) errors.push("Producto no encontrado.");

  if (![MovementType.IN, MovementType.OUT, MovementType.ADJUST].includes(movement.type))
    errors.push("Tipo de movimiento inválido.");

  const qty = Number(movement.qty);
  if (Number.isNaN(qty)) errors.push("Cantidad inválida.");

  if (movement.type === MovementType.ADJUST) {
    if (qty < 0) errors.push("En ajuste, el stock final no puede ser negativo.");
  } else {
    if (qty <= 0) errors.push("La cantidad debe ser mayor a 0.");
  }

  return errors;
}

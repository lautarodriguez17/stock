import { MovementType } from "./types.js";

/**
 * Calcula stock por producto en base a movimientos.
 * Reglas:
 * - IN suma
 * - OUT resta
 * - ADJUST setea stock absoluto (qty)
 */
export function computeStock(products, movements) {
  const stockById = Object.fromEntries(products.map((p) => [p.id, 0]));

  for (const m of movements) {
    if (!(m.productId in stockById)) continue;

    if (m.type === MovementType.IN) stockById[m.productId] += m.qty;
    if (m.type === MovementType.OUT) stockById[m.productId] -= m.qty;
    if (m.type === MovementType.ADJUST) stockById[m.productId] = m.qty;
  }

  return stockById;
}

/**
 * Métricas pedidas:
 * - total productos
 * - low stock count
 * - valuación estimada: sum(stock * cost)
 * - margen estimado (unitario): price - cost (promedio simple) + total potencial (stock * (price-cost))
 */
export function computeMetrics(products, stockById) {
  const activeProducts = products.filter((p) => p.active !== false);

  let lowStockCount = 0;
  let valuation = 0; // stock * cost
  let potentialMargin = 0; // stock * (price-cost)

  for (const p of activeProducts) {
    const stock = stockById[p.id] ?? 0;
    if (stock <= (p.minStock ?? 0)) lowStockCount += 1;

    valuation += stock * (p.cost ?? 0);
    potentialMargin += stock * ((p.price ?? 0) - (p.cost ?? 0));
  }

  return {
    totalProducts: activeProducts.length,
    lowStockCount,
    valuation,
    potentialMargin
  };
}

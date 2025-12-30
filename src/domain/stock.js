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
 * Métricas:
 * - total productos
 * - low stock count
 * - valuación estimada: sum(stock * cost)
 * - margen estimado (unitario): price - cost + total potencial (stock * (price-cost))
 * - ganancia bruta: sum(qty * price) de movimientos de salida
 */
export function computeMetrics(products, stockById, movements = []) {
  const activeProducts = products.filter((p) => p.active !== false);
  const productById = Object.fromEntries(products.map((p) => [p.id, p]));

  let lowStockCount = 0;
  let valuation = 0; // stock * cost
  let potentialMargin = 0; // stock * (price-cost)
  let grossSales = 0; // total de ventas registradas

  for (const p of activeProducts) {
    const stock = stockById[p.id] ?? 0;
    if (stock <= (p.minStock ?? 0)) lowStockCount += 1;

    valuation += stock * (p.cost ?? 0);
    potentialMargin += stock * ((p.price ?? 0) - (p.cost ?? 0));
  }

  for (const m of movements) {
    if (m.type !== MovementType.OUT) continue;
    const product = productById[m.productId];
    if (!product) continue;
    grossSales += (product.price ?? 0) * (m.qty ?? 0);
  }

  return {
    totalProducts: activeProducts.length,
    lowStockCount,
    valuation,
    potentialMargin,
    grossSales
  };
}

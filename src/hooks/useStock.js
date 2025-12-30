import { useMemo } from "react";
import { useStockContext } from "../state/StockContext.jsx";
import { computeMetrics, computeStock } from "../domain/stock.js";

export function useStock() {
  const { state } = useStockContext();

  const stockById = useMemo(
    () => computeStock(state.products, state.movements),
    [state.products, state.movements]
  );

  const metrics = useMemo(
    () => computeMetrics(state.products, stockById, state.movements),
    [state.products, stockById, state.movements]
  );

  return { stockById, metrics };
}

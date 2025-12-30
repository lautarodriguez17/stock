import React from "react";
import Card from "../components/Card.jsx";
import { useStockContext } from "../state/StockContext.jsx";
import { useStock } from "../hooks/useStock.js";

export default function Dashboard() {
  const { state } = useStockContext();
  const { stockById, metrics } = useStock();

  const lowProducts = state.products
    .filter((p) => p.active !== false)
    .map((p) => ({
      ...p,
      stock: stockById[p.id] ?? 0
    }))
    .filter((p) => p.stock <= (p.minStock ?? 0))
    .sort((a, b) => (a.stock - b.stock));

  return (
    <div className="grid3">
      <Card title="Resumen">
        <div className="kpi">
          <div>
            <div className="kpiLabel">Productos</div>
            <div className="kpiValue">{metrics.totalProducts}</div>
          </div>
          <div>
            <div className="kpiLabel">Stock bajo</div>
            <div className="kpiValue">{metrics.lowStockCount}</div>
          </div>
        </div>
      </Card>

      <Card title="Valuación estimada (costo)">
        <div className="kpiValue">{money(metrics.valuation)}</div>
        <p className="muted">Suma de (stock * costo) para productos activos.</p>
      </Card>

      <Card title="Margen potencial (sobre stock)">
        <div className="kpiValue">{money(metrics.potentialMargin)}</div>
        <p className="muted">Suma de (stock * (precio - costo)).</p>
      </Card>

      <Card title="Alertas de stock bajo" right={<span className="pill">{lowProducts.length} items</span>}>
        {lowProducts.length === 0 ? (
          <p className="muted">No hay alertas 🎉</p>
        ) : (
          <ul className="list">
            {lowProducts.slice(0, 10).map((p) => (
              <li key={p.id} className="listItem">
                <div>
                  <b>{p.name}</b> <span className="muted">({p.sku})</span>
                  <div className="muted">{p.category}</div>
                </div>
                <div className="right">
                  <span className="badgeLow">Stock {p.stock} / Mín {p.minStock}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function money(n) {
  return Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

import React from "react";
import { useStock } from "../hooks/useStock.js";

export default function Layout({ children }) {
  const { metrics } = useStock();
  const needsAttention = metrics.lowStockCount > 0;

  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <div className="brandIcon" aria-hidden="true">🛍️</div>
          <div>
            <h1 className="title">Kiosco Stock</h1>
            <p className="subtitle">Panel diario y gestión de stock</p>
          </div>
        </div>

        <div className="headerActions">
          <div className={`statusPill ${needsAttention ? "statusWarning" : "statusOk"}`}>
            <span className="statusEmoji" aria-hidden="true">
              {needsAttention ? "⚠️" : "✅"}
            </span>
            <span className="statusText">
              Estado: <strong>{needsAttention ? "Atención requerida" : "Todo en orden"}</strong>
            </span>
          </div>
          <button className="iconButton" type="button" aria-label="Más opciones">
            ⋮
          </button>
        </div>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">
        <span>Datos guardados en tu navegador (localStorage).</span>
      </footer>
    </div>
  );
}

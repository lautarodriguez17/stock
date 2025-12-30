import React, { useMemo } from "react";
import Table from "./Table.jsx";

export default function ProductTable({ products, stockById, onEdit, onDeactivate }) {
  const rows = useMemo(() => {
    return products.map((p) => {
      const stock = stockById[p.id] ?? 0;
      const low = stock <= (p.minStock ?? 0);
      const status = low ? (stock === 0 ? "Bajo" : "Stock bajo") : "OK";
      return {
        ...p,
        stock,
        status,
        _rowClass: ""
      };
    });
  }, [products, stockById]);

  const columns = [
    { key: "name", header: "Producto" },
    { key: "sku", header: "SKU" },
    { key: "category", header: "Categoría" },
    {
      key: "cost",
      header: "Costo",
      render: (r) => formatMoney(r.cost)
    },
    {
      key: "price",
      header: "Precio",
      render: (r) => formatMoney(r.price)
    },
    {
      key: "status",
      header: "Estado",
      render: (r) =>
        r.status === "OK" ? null : (
          <span className={`pillStatus ${r.status === "Bajo" ? "pillDanger" : "pillWarn"}`}>
            {r.status}
          </span>
        )
    },
    {
      key: "stockMin",
      header: "Stock / Min",
      render: (r) => (
        <span className="stockMin">
          {r.stock} <span className="muted">/</span> {r.minStock ?? 0}
        </span>
      )
    },
    {
      key: "actions",
      header: "Acciones",
      render: (r) => (
        <div className="actions">
          <button className="btnTablePrimary" onClick={() => onEdit(r)}>Editar</button>
          <button className="btnTableGhost" onClick={() => onDeactivate(r.id)}>Desactivar</button>
        </div>
      )
    }
  ];

  return <Table columns={columns} rows={rows} emptyText="No hay productos." />;
}

function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

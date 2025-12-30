import React, { useMemo } from "react";
import Table from "./Table.jsx";

export default function ProductTable({ products, stockById, onEdit, onDeactivate }) {
  const rows = useMemo(() => {
    return products.map((p) => {
      const stock = stockById[p.id] ?? 0;
      const low = stock <= (p.minStock ?? 0);
      return {
        ...p,
        stock,
        _rowClass: low ? "rowLow" : ""
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
      key: "stock",
      header: "Stock",
      render: (r) => (
        <span>
          <b>{r.stock}</b> {r.stock <= (r.minStock ?? 0) ? <span className="badgeLow">Bajo</span> : null}
        </span>
      )
    },
    { key: "minStock", header: "Mín" },
    {
      key: "actions",
      header: "Acciones",
      render: (r) => (
        <div className="actions">
          <button className="btn" onClick={() => onEdit(r)}>Editar</button>
          <button className="btnDanger" onClick={() => onDeactivate(r.id)}>Inactivar</button>
        </div>
      )
    }
  ];

  return <Table columns={columns} rows={rows} emptyText="No hay productos." />;
}

function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

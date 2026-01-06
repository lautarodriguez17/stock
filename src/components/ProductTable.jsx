import React, { useMemo } from "react";
import useMediaQuery from "../hooks/useMediaQuery.js";
import Table from "./Table.jsx";

export default function ProductTable({ products, stockById, onEdit, onDeactivate, highlightId }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const rows = useMemo(() => {
    return products.map((p) => {
      const stock = stockById[p.id] ?? 0;
      const low = stock <= (p.minStock ?? 0);
      const status = low ? (stock === 0 ? "Bajo" : "Stock bajo") : "OK";
      const rowId = p.id ? `product-${p.id}` : "";
      return {
        ...p,
        stock,
        status,
        _rowClass: p.id === highlightId ? "rowFocus" : "",
        _rowId: rowId
      };
    });
  }, [products, stockById, highlightId]);

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

  if (!isMobile) {
    return <Table columns={columns} rows={rows} emptyText="No hay productos." />;
  }

  return (
    <div className="mobileCardList">
      {rows.length === 0 ? (
        <div className="tableEmpty">No hay productos.</div>
      ) : (
        rows.map((r) => (
          <article
            className={`mobileCard ${r.id === highlightId ? "cardFocus" : ""}`}
            key={r.id || r.sku || r.name}
            data-row-id={r._rowId || undefined}
          >
            <div className="mobileCardHeader">
              <div>
                <p className="mobileCardTitle">{r.name}</p>
                <p className="mobileMuted">{r.sku || "Sin SKU"}</p>
              </div>
              {r.status === "OK" ? null : (
                <span className={`pillStatus ${r.status === "Bajo" ? "pillDanger" : "pillWarn"}`}>
                  {r.status}
                </span>
              )}
            </div>

            <div className="mobileCardRow">
              <span className="mobileLabel">Categoria</span>
              <span>{r.category || "Sin categoria"}</span>
            </div>

            <div className="mobileCardGrid">
              <div>
                <span className="mobileLabel">Costo</span>
                <div className="mobileValue">{formatMoney(r.cost)}</div>
              </div>
              <div>
                <span className="mobileLabel">Precio</span>
                <div className="mobileValue">{formatMoney(r.price)}</div>
              </div>
            </div>

            <div className="mobileCardRow">
              <span className="mobileLabel">Stock / Min</span>
              <span className="mobileValue">{r.stock} / {r.minStock ?? 0}</span>
            </div>

            <div className="mobileCardActions">
              <button className="btnPrimary" type="button" onClick={() => onEdit(r)}>Editar</button>
              <button className="btnGhost" type="button" onClick={() => onDeactivate(r.id)}>
                Desactivar
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
}

function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

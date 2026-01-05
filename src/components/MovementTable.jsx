import React, { useMemo } from "react";
import useMediaQuery from "../hooks/useMediaQuery.js";
import Table from "./Table.jsx";

export default function MovementTable({ products, movements }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const nameById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, `${p.name} (${p.sku})`])),
    [products]
  );

  const rows = useMemo(() => movements.slice(0, 50), [movements]);

  const columns = [
    {
      key: "atISO",
      header: "Fecha",
      render: (r) => new Date(r.atISO).toLocaleString("es-AR")
    },
    {
      key: "productId",
      header: "Producto",
      render: (r) => nameById[r.productId] ?? "Producto no encontrado"
    },
    { key: "type", header: "Tipo" },
    {
      key: "qty",
      header: "Cantidad",
      render: (r) => <b>{r.qty}</b>
    },
    { key: "user", header: "Usuario" },
    { key: "note", header: "Nota" }
  ];

  if (!isMobile) {
    return (
      <Table
        columns={columns}
        rows={rows}
        emptyText="No hay movimientos."
        maxHeight="360px"
        scrollThreshold={5}
      />
    );
  }

  return (
    <div className="mobileCardList">
      {rows.length === 0 ? (
        <div className="tableEmpty">No hay movimientos.</div>
      ) : (
        rows.map((r) => (
          <article className="mobileCard" key={r.id || r.atISO}>
            <div className="mobileCardHeader">
              <div>
                <p className="mobileCardTitle">{nameById[r.productId] ?? "Producto no encontrado"}</p>
                <p className="mobileMuted">{new Date(r.atISO).toLocaleString("es-AR")}</p>
              </div>
              <span className={`pillStatus ${movementClass(r.type)}`}>
                {labelMovement(r.type)}
              </span>
            </div>

            <div className="mobileCardRow">
              <span className="mobileLabel">Cantidad</span>
              <span className="mobileValue">{r.qty}</span>
            </div>
            <div className="mobileCardRow">
              <span className="mobileLabel">Usuario</span>
              <span>{r.user}</span>
            </div>
            {r.note ? (
              <div className="mobileCardRow">
                <span className="mobileLabel">Nota</span>
                <span>{r.note}</span>
              </div>
            ) : null}
          </article>
        ))
      )}
    </div>
  );
}

function movementClass(type) {
  if (type === "OUT") return "pillDanger";
  if (type === "IN") return "pillSuccess";
  return "pillWarn";
}

function labelMovement(type) {
  if (type === "OUT") return "Venta";
  if (type === "IN") return "Compra";
  return "Ajuste";
}

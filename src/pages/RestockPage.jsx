import React, { useEffect, useMemo, useRef, useState } from "react";
import Card from "../components/Card.jsx";
import Table from "../components/Table.jsx";
import { useStockContext } from "../state/StockContext.jsx";
import { useStock } from "../hooks/useStock.js";
import { useMovements } from "../hooks/useMovements.js";
import useMediaQuery from "../hooks/useMediaQuery.js";
import { MovementType } from "../domain/types.js";
import { can, PermissionAction } from "../domain/permissions.js";

export default function RestockPage({ focusProductId, onFocusHandled }) {
  const { state, role } = useStockContext();
  const { stockById } = useStock();
  const { addMovement } = useMovements();
  const inputRefs = useRef([]);
  const [qtyById, setQtyById] = useState({});
  const [completedIds, setCompletedIds] = useState({});
  const [message, setMessage] = useState("");
  const [highlightId, setHighlightId] = useState(null);
  const highlightTimer = useRef(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const canCreateIn = can(role, PermissionAction.MOVEMENT_CREATE_IN);

  const lowProducts = useMemo(() => {
    return state.products
      .filter((p) => p.active !== false)
      .filter((p) => (stockById[p.id] ?? 0) <= (p.minStock ?? 0))
      .filter((p) => !completedIds[p.id])
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [state.products, stockById, completedIds]);

  useEffect(() => {
    setQtyById((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const product of lowProducts) {
        if (next[product.id] === undefined) {
          const stockActual = stockById[product.id] ?? 0;
          next[product.id] = String(getSuggestedQty(product, stockActual));
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [lowProducts, stockById]);

  useEffect(() => {
    const cleanup = () => {
      if (document.body.dataset.printing === "restock") {
        delete document.body.dataset.printing;
      }
    };
    window.addEventListener("afterprint", cleanup);
    return () => window.removeEventListener("afterprint", cleanup);
  }, []);

  useEffect(() => () => {
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
  }, []);

  const rows = useMemo(() => {
    return lowProducts.map((product, index) => {
      const stockActual = stockById[product.id] ?? 0;
      const minStock = product.minStock ?? 0;
      const inputValue = qtyById[product.id];
      const suggested = parseQty(inputValue, getSuggestedQty(product, stockActual));
      const actionQty = parseQty(inputValue, 0);
      return {
        id: product.id,
        name: product.name,
        stockActual,
        minStock,
        suggested,
        actionQty,
        index,
        product,
        _rowClass: product.id === highlightId ? "rowFocus" : "",
        _rowId: product.id ? `restock-${product.id}` : ""
      };
    });
  }, [lowProducts, stockById, qtyById, highlightId]);

  useEffect(() => {
    if (!focusProductId || highlightId === focusProductId) return;
    const row = rows.find((item) => item.id === focusProductId);
    if (!row) return;
    const el = document.querySelector(`.noPrint [data-row-id="restock-${focusProductId}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightId(focusProductId);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightId(null), 2400);
    onFocusHandled?.();
    setTimeout(() => {
      inputRefs.current[row.index]?.focus();
    }, 150);
  }, [focusProductId, highlightId, rows, onFocusHandled]);

  function handleQtyChange(productId, value) {
    setQtyById((prev) => ({ ...prev, [productId]: value }));
  }

  function handleKeyDown(event, index) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    inputRefs.current[index + 1]?.focus();
  }

  function handlePrint() {
    document.body.dataset.printing = "restock";
    window.print();
  }

  function handleMarkPurchased(product) {
    setMessage("");
    if (!canCreateIn) {
      alert("No tienes permiso para registrar compras.");
      return;
    }

    const qty = parseQty(qtyById[product.id], 0);
    if (qty <= 0) {
      alert("La cantidad sugerida debe ser mayor a 0.");
      return;
    }

    const confirmed = window.confirm(
      `Registrar compra de ${qty} para "${product.name}"?`
    );
    if (!confirmed) return;

    const ok = addMovement({
      productId: product.id,
      type: MovementType.IN,
      qty,
      note: "Reposicion"
    });
    if (!ok) return;

    setCompletedIds((prev) => ({ ...prev, [product.id]: true }));
    setMessage(`Reposicion registrada para ${product.name}.`);
  }

  const columns = [
    { key: "name", header: "Producto" },
    { key: "stockActual", header: "Stock actual" },
    { key: "minStock", header: "Stock minimo" },
    {
      key: "suggested",
      header: "Cantidad sugerida",
      render: (row) => (
        <input
          ref={(el) => {
            inputRefs.current[row.index] = el;
          }}
          className="input restockInput"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={qtyById[row.id] ?? ""}
          onChange={(e) => handleQtyChange(row.id, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, row.index)}
          autoFocus={row.index === 0}
        />
      )
    },
    {
      key: "actions",
      header: "Acciones",
      render: (row) => (
        <button
          className="btnSuccess"
          type="button"
          onClick={() => handleMarkPurchased(row.product)}
          disabled={!canCreateIn || row.actionQty <= 0}
        >
          Marcar como comprado
        </button>
      )
    }
  ];

  const printColumns = [
    { key: "name", header: "Producto" },
    { key: "stockActual", header: "Stock actual" },
    { key: "minStock", header: "Stock minimo" },
    { key: "suggested", header: "Cantidad sugerida" }
  ];

  return (
    <div className="restockPage">
      <Card
        title="Reposicion"
        right={(
          <button className="btnPrimary noPrint" type="button" onClick={handlePrint}>
            Exportar / Imprimir lista
          </button>
        )}
      >
        <p className="muted noPrint">
          Lista automatica de compra para productos con stock bajo.
        </p>

        <div className="noPrint">
          {!isMobile ? (
            <Table
              columns={columns}
              rows={rows}
              emptyText="No hay productos con stock bajo."
              maxHeight="520px"
              scrollThreshold={8}
            />
          ) : (
            <div className="mobileCardList">
              {rows.length === 0 ? (
                <div className="tableEmpty">No hay productos con stock bajo.</div>
              ) : (
                rows.map((row) => (
                  <article
                    className={`mobileCard ${row.id === highlightId ? "cardFocus" : ""}`}
                    key={row.id}
                    data-row-id={row._rowId || undefined}
                  >
                    <div className="mobileCardHeader">
                      <h4 className="mobileCardTitle">{row.name}</h4>
                      <span className="pill">{`Min ${row.minStock}`}</span>
                    </div>

                    <div className="mobileCardRow">
                      <span className="mobileLabel">Stock actual</span>
                      <span className="mobileValue">{row.stockActual}</span>
                    </div>

                    <label className="field mobileInlineField">
                      <span className="fieldLabel">Cantidad sugerida</span>
                      <input
                        ref={(el) => {
                          inputRefs.current[row.index] = el;
                        }}
                        className="input"
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={qtyById[row.id] ?? ""}
                        onChange={(e) => handleQtyChange(row.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, row.index)}
                        autoFocus={row.index === 0}
                      />
                    </label>

                    <div className="mobileCardActions">
                      <button
                        className="btnSuccess"
                        type="button"
                        onClick={() => handleMarkPurchased(row.product)}
                        disabled={!canCreateIn || row.actionQty <= 0}
                      >
                        Marcar como comprado
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </div>

        {message ? <div className="successBox noPrint">{message}</div> : null}

        <div className="printArea">
          <h2 className="printTitle">Lista de reposicion</h2>
          <p className="muted printDate">{new Date().toLocaleString("es-AR")}</p>
          <Table
            columns={printColumns}
            rows={rows}
            emptyText="No hay productos con stock bajo."
          />
        </div>
      </Card>
    </div>
  );
}

function getTargetStock(product, fallback) {
  const target = Number(product.stockObjetivo);
  if (Number.isFinite(target) && target >= 0) return target;
  return Number(fallback ?? 0);
}

function getSuggestedQty(product, stockActual) {
  const target = getTargetStock(product, product.minStock ?? 0);
  const diff = target - stockActual;
  return Math.max(0, diff);
}

function parseQty(value, fallback) {
  if (value === "" || value === undefined || value === null) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(0, num) : fallback;
}

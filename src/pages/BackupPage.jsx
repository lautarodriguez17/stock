import React, { useMemo, useState } from "react";
import Card from "../components/Card.jsx";
import Field from "../components/Field.jsx";
import Table from "../components/Table.jsx";
import { useStockContext } from "../state/StockContext.jsx";
import { useStock } from "../hooks/useStock.js";
import useMediaQuery from "../hooks/useMediaQuery.js";
import { ActionType } from "../state/actions.js";
import { Roles } from "../domain/permissions.js";

const APP_VERSION = "1.0";

export default function BackupPage() {
  const { state, dispatch, role } = useStockContext();
  const { stockById } = useStock();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const productSkuById = useMemo(
    () => Object.fromEntries(state.products.map((p) => [p.id, p.sku || ""])),
    [state.products]
  );
  const summaryRows = [
    { id: "products", label: "Productos", value: state.products.length },
    { id: "movements", label: "Movimientos", value: state.movements.length }
  ];

  function exportJson() {
    setError("");
    const payload = {
      exportedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      products: state.products,
      movements: state.movements
    };
    const filename = `kiosco-backup-${payload.exportedAt.slice(0, 10)}.json`;
    downloadFile(filename, JSON.stringify(payload, null, 2), "application/json");
    setMessage("Backup JSON generado.");
  }

  function exportProductsCsv() {
    setError("");
    const headers = [
      "name",
      "sku",
      "category",
      "cost",
      "price",
      "stock",
      "minStock",
      "active"
    ];
    const rows = state.products.map((product) => ({
      name: product.name ?? "",
      sku: product.sku ?? "",
      category: product.category ?? "",
      cost: product.cost ?? 0,
      price: product.price ?? 0,
      stock: stockById[product.id] ?? 0,
      minStock: product.minStock ?? 0,
      active: product.active !== false ? "true" : "false"
    }));
    downloadFile("products.csv", buildCsv(headers, rows), "text/csv;charset=utf-8;");
    setMessage("CSV de productos generado.");
  }

  function exportMovementsCsv() {
    setError("");
    const headers = [
      "datetime",
      "type",
      "productId",
      "productSku",
      "qty",
      "note",
      "user",
      "role"
    ];
    const rows = state.movements.map((movement) => ({
      datetime: movement.atISO ?? "",
      type: movement.type ?? "",
      productId: movement.productId ?? "",
      productSku: productSkuById[movement.productId] ?? "",
      qty: movement.qty ?? 0,
      note: movement.note ?? "",
      user: movement.user ?? "",
      role: movement.role ?? ""
    }));
    downloadFile("movements.csv", buildCsv(headers, rows), "text/csv;charset=utf-8;");
    setMessage("CSV de movimientos generado.");
  }

  async function importJson() {
    setError("");
    setMessage("");

    if (role !== Roles.ADMIN) {
      setError("Solo Admin puede importar datos.");
      return;
    }

    if (!file) {
      setError("Selecciona un archivo JSON.");
      return;
    }

    let data;
    try {
      const raw = await file.text();
      data = JSON.parse(raw);
    } catch {
      setError("El archivo no es un JSON valido.");
      return;
    }

    const validation = validateImportData(data);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    const confirmed = window.confirm(
      "Esto reemplazara tus datos actuales. Deseas continuar?"
    );
    if (!confirmed) return;

    dispatch({
      type: ActionType.INIT,
      payload: {
        products: data.products,
        movements: data.movements
      }
    });
    setMessage("Importacion completada.");
  }

  return (
    <div className="backupPage">
      <Card title="Backup">
        <p className="muted">Exporta tus datos para backup o migracion.</p>
        <div className="actions backupActions">
          <button className="btnPrimary" type="button" onClick={exportJson}>
            Exportar JSON
          </button>
          <button className="btn" type="button" onClick={exportProductsCsv}>
            Export CSV Productos
          </button>
          <button className="btn" type="button" onClick={exportMovementsCsv}>
            Export CSV Movimientos
          </button>
        </div>
      </Card>

      <Card title="Importar JSON">
        <p className="muted">Reemplaza todos los datos actuales por el backup.</p>
        <Field label="Archivo JSON">
          <input
            className="input"
            type="file"
            accept="application/json"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </Field>

        <div className="backupMode">
          <label className="row gap">
            <input type="radio" checked readOnly />
            <span className="muted">Reemplazar todo</span>
          </label>
        </div>

        <div className="actions">
          <button className="btnDanger" type="button" onClick={importJson}>
            Importar JSON
          </button>
        </div>

        {error ? <div className="errorBox">{error}</div> : null}
        {message ? <div className="successBox">{message}</div> : null}
      </Card>

      <Card title="Vista rapida">
        {!isMobile ? (
          <Table
            columns={[
              { key: "label", header: "Dato" },
              { key: "value", header: "Cantidad" }
            ]}
            rows={summaryRows}
            emptyText="Sin datos."
          />
        ) : (
          <div className="mobileCardList">
            {summaryRows.map((row) => (
              <article className="mobileCard" key={row.id}>
                <div className="mobileCardRow">
                  <span className="mobileLabel">{row.label}</span>
                  <span className="mobileValue">{row.value}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function validateImportData(data) {
  if (!data || typeof data !== "object") {
    return { ok: false, error: "Formato invalido: falta el objeto principal." };
  }
  if (!Array.isArray(data.products)) {
    return { ok: false, error: "Formato invalido: products faltante." };
  }
  if (!Array.isArray(data.movements)) {
    return { ok: false, error: "Formato invalido: movements faltante." };
  }
  return { ok: true };
}

function buildCsv(headers, rows) {
  const headerLine = headers.map(toCsvValue).join(",");
  const lines = rows.map((row) =>
    headers.map((header) => toCsvValue(row[header])).join(",")
  );
  return [headerLine, ...lines].join("\n");
}

function toCsvValue(value) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/["\n,]/.test(str)) {
    return `"${str.replace(/"/g, "\"\"")}"`;
  }
  return str;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

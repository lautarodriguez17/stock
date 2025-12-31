import React, { useEffect, useMemo, useState } from "react";
import Field from "./Field.jsx";
import { MovementType } from "../domain/types.js";

const TYPE_OPTIONS = [
  { value: MovementType.OUT, label: "Salida (venta)" },
  { value: MovementType.IN, label: "Entrada (compra)" },
  { value: MovementType.ADJUST, label: "Ajuste (set stock)" }
];
const DEFAULT_ALLOWED_TYPES = TYPE_OPTIONS.map((option) => option.value);

export default function MovementForm({
  products,
  stockById,
  onSubmit,
  errors,
  defaultType,
  allowedTypes
}) {
  const activeProducts = useMemo(() => products.filter((p) => p.active !== false), [products]);
  const resolvedAllowedTypes =
    Array.isArray(allowedTypes) && allowedTypes.length ? allowedTypes : DEFAULT_ALLOWED_TYPES;
  const visibleTypeOptions = TYPE_OPTIONS.filter((option) =>
    resolvedAllowedTypes.includes(option.value)
  );

  const [productId, setProductId] = useState(activeProducts[0]?.id || "");
  const [type, setType] = useState(() =>
    resolveInitialType(defaultType, resolvedAllowedTypes)
  );
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const selectedStock = productId ? stockById[productId] ?? 0 : 0;

  useEffect(() => {
    if (!resolvedAllowedTypes.includes(type)) {
      setType(resolveInitialType(defaultType, resolvedAllowedTypes));
    }
  }, [defaultType, resolvedAllowedTypes, type]);

  function submit(e) {
    e.preventDefault();
    const ok = onSubmit({ productId, type, qty, note });
    if (ok) {
      setQty(1);
      setNote("");
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <Field label="Producto">
        <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)}>
          {activeProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku}) · stock: {stockById[p.id] ?? 0}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid2">
        <Field label="Tipo">
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            {visibleTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={type === MovementType.ADJUST ? "Stock final" : "Cantidad"}>
          <input
            className="input"
            type="number"
            min="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Nota (opcional)" hint={`Stock actual: ${selectedStock}`}>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      {errors?.length ? (
        <div className="errorBox">
          <b>Corregí:</b>
          <ul>
            {errors.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <button className="btnPrimary" type="submit">Registrar movimiento</button>
    </form>
  );
}

function resolveInitialType(defaultType, allowedTypes) {
  if (defaultType && allowedTypes.includes(defaultType)) return defaultType;
  return allowedTypes[0] ?? MovementType.OUT;
}

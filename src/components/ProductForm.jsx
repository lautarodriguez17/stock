import React, { useEffect, useState } from "react";
import Field from "./Field.jsx";

const empty = {
  id: "",
  name: "",
  sku: "",
  category: "",
  cost: "",
  price: "",
  minStock: ""
};

export default function ProductForm({
  initialValue,
  onSubmit,
  onCancel,
  errors,
  categoryOptions = [],
  canCreate = true
}) {
  const [form, setForm] = useState(empty);
  const canSubmit = form.id ? true : canCreate;

  useEffect(() => {
    if (initialValue) {
      setForm({
        id: initialValue.id,
        name: initialValue.name || "",
        sku: initialValue.sku || "",
        category: initialValue.category || "",
        cost: String(initialValue.cost ?? ""),
        price: String(initialValue.price ?? ""),
        minStock: String(initialValue.minStock ?? "")
      });
    } else {
      setForm(empty);
    }
  }, [initialValue]);

  function submit(e) {
    e.preventDefault();
    const ok = onSubmit(form);
    if (ok) setForm(empty);
  }

  return (
    <form className="productForm" onSubmit={submit}>
      <div className="productFormGrid">
        <Field label="Nombre">
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ej: Agua 500ml"
          />
        </Field>

        <Field label="SKU / Código">
          <input
            className="input"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            placeholder="Ej: AGUA-500"
          />
        </Field>
      </div>

      <div className="productFormGrid">
        <Field label="Categoría">
          <div className="inputSelectWrap">
            <input
              className="input inputSelect"
              list="categoryOptions"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="Seleccionar"
            />
            <span className="inputSelectIcon" aria-hidden="true">▾</span>
            <datalist id="categoryOptions">
              {categoryOptions.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
        </Field>

        <Field label="Stock mínimo">
          <input
            className="input"
            type="number"
            min="0"
            value={form.minStock}
            onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))}
            placeholder="Ej: 10"
          />
        </Field>
      </div>

      <div className="productFormGrid">
        <Field label="Costo">
          <input
            className="input"
            type="number"
            min="0"
            value={form.cost}
            onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
          />
        </Field>

        <Field label="Precio">
          <input
            className="input"
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
        </Field>
      </div>

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

      <div className="productFormActions">
        {canSubmit ? (
          <button className="btnSuccess" type="submit">
            {form.id ? "Guardar cambios" : "Agregar Producto"}
          </button>
        ) : null}

        {onCancel ? (
          <button className="btnGhost" type="button" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}

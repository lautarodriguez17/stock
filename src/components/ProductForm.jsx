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

export default function ProductForm({ initialValue, onSubmit, onCancel, errors }) {
  const [form, setForm] = useState(empty);

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
    <form className="form" onSubmit={submit}>
      <div className="grid2">
        <Field label="Nombre">
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ej: Agua 500ml"
          />
        </Field>

        <Field label="SKU/Código">
          <input
            className="input"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            placeholder="Ej: AGUA-500"
          />
        </Field>
      </div>

      <div className="grid2">
        <Field label="Categoría">
          <input
            className="input"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="Ej: Bebidas"
          />
        </Field>

        <Field label="Stock mínimo">
          <input
            className="input"
            type="number"
            min="0"
            value={form.minStock}
            onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))}
          />
        </Field>
      </div>

      <div className="grid2">
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

      <div className="row">
        <button className="btnPrimary" type="submit">
          {form.id ? "Guardar cambios" : "Agregar producto"}
        </button>

        {onCancel ? (
          <button className="btn" type="button" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}

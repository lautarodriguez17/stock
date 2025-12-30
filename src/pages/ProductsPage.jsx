import React, { useMemo, useState } from "react";
import Card from "../components/Card.jsx";
import ProductForm from "../components/ProductForm.jsx";
import ProductTable from "../components/ProductTable.jsx";
import { useProducts } from "../hooks/useProducts.js";
import { useStock } from "../hooks/useStock.js";

export default function ProductsPage() {
  const { products, allProducts, upsertProduct, deactivateProduct, errorList } = useProducts();
  const { stockById } = useStock();

  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ALL");

  const categories = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.category).filter(Boolean));
    return ["ALL", ...Array.from(set).sort()];
  }, [allProducts]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return products
      .filter((p) => (cat === "ALL" ? true : p.category === cat))
      .filter((p) => {
        if (!qq) return true;
        return p.name.toLowerCase().includes(qq) || (p.sku || "").toLowerCase().includes(qq);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, q, cat]);

  return (
    <div className="grid2">
      <Card
        title={editing ? "Editar producto" : "Agregar producto"}
        right={
          editing ? (
            <button className="btn" onClick={() => setEditing(null)}>Nuevo</button>
          ) : null
        }
      >
        <ProductForm
          initialValue={editing}
          errors={errorList}
          onSubmit={(data) => {
            const ok = upsertProduct(data);
            if (ok) setEditing(null);
            return ok;
          }}
          onCancel={editing ? () => setEditing(null) : null}
        />
      </Card>

      <Card title="Listado">
        <div className="row gap">
          <input
            className="input"
            placeholder="Buscar por nombre o SKU..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 10 }}>
          <ProductTable
            products={filtered}
            stockById={stockById}
            onEdit={(p) => setEditing(p)}
            onDeactivate={(id) => deactivateProduct(id)}
          />
        </div>

        <p className="muted" style={{ marginTop: 10 }}>
          Tip: doble click no edita acá (a propósito). Editás con el formulario para mantener validaciones claras.
        </p>
      </Card>
    </div>
  );
}

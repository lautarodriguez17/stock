import React, { useMemo, useState } from "react";
import ProductForm from "../components/ProductForm.jsx";
import ProductTable from "../components/ProductTable.jsx";
import { useProducts } from "../hooks/useProducts.js";
import { useStock } from "../hooks/useStock.js";
import { useStockContext } from "../state/StockContext.jsx";
import { can, PermissionAction } from "../domain/permissions.js";

export default function ProductsPage() {
  const { products, allProducts, upsertProduct, deactivateProduct, errorList } = useProducts();
  const { stockById } = useStock();
  const { role } = useStockContext();
  const canCreateProduct = can(role, PermissionAction.PRODUCT_CREATE);

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
    <div className="productPage">
      <section className="productCard">
        <div className="productCardHeader">
          <div className="productCardTitle">
            <span className="productCardIcon" aria-hidden="true">➕</span>
            <div>
              <h3>Agregar Nuevo Producto</h3>
              <p className="muted">Completa los datos para sumar un nuevo ítem al inventario.</p>
            </div>
          </div>
          {editing ? (
            <button className="btnGhost" onClick={() => setEditing(null)}>Nuevo</button>
          ) : null}
        </div>

        <ProductForm
          initialValue={editing}
          categoryOptions={categories.filter((c) => c !== "ALL")}
          errors={errorList}
          canCreate={canCreateProduct}
          onSubmit={(data) => {
            const ok = upsertProduct(data);
            if (ok) setEditing(null);
            return ok;
          }}
          onCancel={editing ? () => setEditing(null) : null}
        />
      </section>

      <section className="productCard">
        <div className="productCardHeader">
          <div className="productCardTitle">
            <span className="productCardIcon" aria-hidden="true">📦</span>
            <div>
              <h3>Listado de Productos</h3>
              <p className="muted">Gestiona los productos activos.</p>
            </div>
          </div>
          <div className="productFilters">
            <input
              className="input"
              placeholder="Buscar producto..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className="input selectInput" value={cat} onChange={(e) => setCat(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <ProductTable
          products={filtered}
          stockById={stockById}
          onEdit={(p) => setEditing(p)}
          onDeactivate={(id) => deactivateProduct(id)}
        />

        <p className="muted productNote">
          Nota: Usa los botones para editar o desactivar productos.
        </p>
      </section>
    </div>
  );
}

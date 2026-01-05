import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Field from "./Field.jsx";
import { MovementType } from "../domain/types.js";

const TYPE_OPTIONS = [
  { value: MovementType.OUT, label: "Salida (venta)" },
  { value: MovementType.IN, label: "Entrada (compra)" },
  { value: MovementType.ADJUST, label: "Ajuste (set stock)" }
];
const DEFAULT_ALLOWED_TYPES = TYPE_OPTIONS.map((option) => option.value);
const SEARCH_LIMIT = 8;

export default function MovementForm({
  products,
  stockById,
  onSubmit,
  errors,
  defaultType,
  allowedTypes
}) {
  const searchInputId = useId();
  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);
  const productSelectRef = useRef(null);
  const qtyInputRef = useRef(null);
  const manualCategoryChangeRef = useRef(false);

  const activeProducts = useMemo(() => products.filter((p) => p.active !== false), [products]);
  const categoryOptions = useMemo(() => {
    const set = new Set();
    for (const product of activeProducts) {
      set.add(normalizeCategory(product.category));
    }
    return Array.from(set).sort();
  }, [activeProducts]);
  const resolvedAllowedTypes =
    Array.isArray(allowedTypes) && allowedTypes.length ? allowedTypes : DEFAULT_ALLOWED_TYPES;
  const visibleTypeOptions = TYPE_OPTIONS.filter((option) =>
    resolvedAllowedTypes.includes(option.value)
  );
  const isTypeLocked = resolvedAllowedTypes.length === 1;

  const [category, setCategory] = useState(categoryOptions[0] || "");
  const [productId, setProductId] = useState("");
  const [type, setType] = useState(() =>
    resolveInitialType(defaultType, resolvedAllowedTypes)
  );
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [quickError, setQuickError] = useState("");

  const filteredProducts = useMemo(() => {
    if (!category) return [];
    return activeProducts.filter((product) => normalizeCategory(product.category) === category);
  }, [activeProducts, category]);

  const selectedStock = productId ? stockById[productId] ?? 0 : 0;

  const normalizedSearch = search.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!normalizedSearch) return [];
    return activeProducts
      .filter((product) => {
        const name = (product.name || "").toLowerCase();
        const sku = (product.sku || "").toLowerCase();
        return name.includes(normalizedSearch) || sku.includes(normalizedSearch);
      })
      .slice(0, SEARCH_LIMIT)
      .map((product) => ({
        ...product,
        stock: stockById[product.id] ?? 0,
        categoryLabel: normalizeCategory(product.category)
      }));
  }, [activeProducts, normalizedSearch, stockById]);

  const hasSearchResults = searchResults.length > 0;
  const isSearchOpen = searchOpen && hasSearchResults;

  useEffect(() => {
    if (!categoryOptions.length) {
      if (category) {
        manualCategoryChangeRef.current = false;
        setCategory("");
      }
      return;
    }
    if (!categoryOptions.includes(category)) {
      manualCategoryChangeRef.current = false;
      setCategory(categoryOptions[0]);
    }
  }, [categoryOptions, category]);

  useEffect(() => {
    if (!filteredProducts.length) {
      if (productId) {
        setProductId("");
      }
      if (manualCategoryChangeRef.current) setQty(1);
      return;
    }
    if (!filteredProducts.some((product) => product.id === productId)) {
      if (manualCategoryChangeRef.current) {
        setProductId("");
        setQty(1);
        return;
      }
      setProductId(filteredProducts[0].id);
    }
  }, [filteredProducts, productId]);

  useEffect(() => {
    if (!resolvedAllowedTypes.includes(type)) {
      setType(resolveInitialType(defaultType, resolvedAllowedTypes));
    }
  }, [defaultType, resolvedAllowedTypes, type]);

  useEffect(() => {
    if (!normalizedSearch || !hasSearchResults) {
      setSearchOpen(false);
      setHighlightedIndex(-1);
      return;
    }
    setHighlightedIndex(0);
  }, [normalizedSearch, hasSearchResults]);

  function focusQty() {
    requestAnimationFrame(() => {
      if (qtyInputRef.current) {
        qtyInputRef.current.focus();
        qtyInputRef.current.select();
      }
    });
  }

  function handleSelectProduct(product) {
    manualCategoryChangeRef.current = false;
    setCategory(product.categoryLabel);
    setProductId(product.id);
    const nextType = resolvedAllowedTypes.includes(MovementType.OUT)
      ? MovementType.OUT
      : (resolvedAllowedTypes[0] ?? MovementType.OUT);
    setType(nextType);
    setSearch("");
    setSearchOpen(false);
    setHighlightedIndex(-1);
    setQuickError("");
    focusQty();
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setSearchOpen(true);
    setQuickError("");
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      setSearchOpen(false);
      setHighlightedIndex(-1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (hasSearchResults) {
        const index = highlightedIndex >= 0 ? highlightedIndex : 0;
        const product = searchResults[index];
        if (product) handleSelectProduct(product);
      }
      return;
    }
    if (!hasSearchResults) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSearchOpen(true);
      setHighlightedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSearchOpen(true);
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    }
  }

  function handleSearchBlur(event) {
    if (!searchBoxRef.current?.contains(event.relatedTarget)) {
      setSearchOpen(false);
    }
  }

  function handleSubmit() {
    setQuickError("");
    if (!productId) {
      setQuickError("Selecciona un producto.");
      productSelectRef.current?.focus();
      return;
    }

    const qtyNumber = Number(qty);
    const qtyInvalid = Number.isNaN(qtyNumber)
      || (type === MovementType.ADJUST ? qtyNumber < 0 : qtyNumber <= 0);
    if (qtyInvalid) {
      setQuickError(type === MovementType.ADJUST
        ? "El stock final no puede ser negativo."
        : "La cantidad debe ser mayor a 0.");
      focusQty();
      return;
    }

    const ok = onSubmit({ productId, type, qty, note });
    if (ok) {
      setQty(1);
      setNote("");
      requestAnimationFrame(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      });
    }
  }

  function submit(e) {
    e.preventDefault();
    handleSubmit();
  }

  function handleQtyKeyDown(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleSubmit();
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="searchBox" ref={searchBoxRef} onBlur={handleSearchBlur}>
        <label className="field" htmlFor={searchInputId}>
          <span className="fieldLabel">Buscar producto</span>
          <input
            id={searchInputId}
            ref={searchInputRef}
            className="input searchInput"
            placeholder="Buscar producto (nombre o codigo)..."
            value={search}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => {
              if (hasSearchResults) setSearchOpen(true);
            }}
            autoComplete="off"
          />
        </label>

        {isSearchOpen ? (
          <div className="searchResults" role="listbox">
            {searchResults.map((product, index) => (
              <button
                key={product.id}
                type="button"
                className={`searchResult ${index === highlightedIndex ? "isActive" : ""}`}
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelectProduct(product)}
              >
                <span className="searchResultMain">
                  {product.name} ({product.sku || "Sin SKU"}) — stock: {product.stock}
                </span>
                <span className="searchResultMeta">{product.categoryLabel}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <Field label="Categoria">
        <select
          className="input"
          value={category}
          onChange={(e) => {
            manualCategoryChangeRef.current = true;
            setCategory(e.target.value);
            setQuickError("");
          }}
          disabled={!categoryOptions.length}
        >
          {!categoryOptions.length ? (
            <option value="">Sin categorias</option>
          ) : null}
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Producto">
        <select
          className="input"
          value={productId}
          onChange={(e) => {
            manualCategoryChangeRef.current = false;
            setProductId(e.target.value);
            setQuickError("");
          }}
          disabled={!category || !filteredProducts.length}
          ref={productSelectRef}
        >
          {!category ? <option value="">Selecciona categoria</option> : null}
          {category && !filteredProducts.length ? (
            <option value="">Sin productos</option>
          ) : null}
          {filteredProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku}) · stock: {stockById[p.id] ?? 0}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid2">
        <Field label="Tipo">
          <select
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={isTypeLocked}
          >
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
            onChange={(e) => {
              setQty(e.target.value);
              setQuickError("");
            }}
            onKeyDown={handleQtyKeyDown}
            ref={qtyInputRef}
          />
        </Field>
      </div>

      <Field label="Nota (opcional)" hint={`Stock actual: ${selectedStock}`}>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      {quickError ? (
        <div className="errorBox">{quickError}</div>
      ) : null}

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

function normalizeCategory(category) {
  const value = (category || "").trim();
  return value || "Sin categoria";
}

import { useMemo, useState } from "react";
import { useStockContext } from "../state/StockContext.jsx";
import { ActionType } from "../state/actions.js";
import { validateProduct } from "../domain/validations.js";
import { can, PermissionAction } from "../domain/permissions.js";

const uid = () => (crypto?.randomUUID?.() ? crypto.randomUUID() : String(Date.now() + Math.random()));

export function useProducts() {
  const { state, dispatch, role } = useStockContext();
  const [errorList, setErrorList] = useState([]);
  const canCreateProduct = can(role, PermissionAction.PRODUCT_CREATE);

  const activeProducts = useMemo(
    () => state.products.filter((p) => p.active !== false),
    [state.products]
  );

  function upsertProduct(input) {
    const isNew = !input.id || !state.products.some((p) => p.id === input.id);
    if (isNew && !canCreateProduct) {
      const errors = ["No tienes permiso para agregar productos."];
      setErrorList(errors);
      alert(errors[0]);
      return false;
    }

    const product = {
      id: input.id || uid(),
      name: (input.name || "").trim(),
      sku: (input.sku || "").trim(),
      category: (input.category || "").trim(),
      cost: Number(input.cost || 0),
      price: Number(input.price || 0),
      minStock: Number(input.minStock || 0),
      active: input.active ?? true
    };

    const errors = validateProduct(product, state.products);
    setErrorList(errors);
    if (errors.length) return false;

    dispatch({ type: ActionType.UPSERT_PRODUCT, payload: product });
    return true;
  }

  function deactivateProduct(id) {
    dispatch({ type: ActionType.DEACTIVATE_PRODUCT, payload: id });
  }

  return {
    products: activeProducts,
    allProducts: state.products,
    upsertProduct,
    deactivateProduct,
    errorList
  };
}

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { productRepo } from "../data/productRepo.js";
import { movementRepo } from "../data/movementRepo.js";
import { stockReducer, initialState } from "./stockReducer.js";
import { ActionType } from "./actions.js";

const StockContext = createContext(null);

export function StockProvider({ children }) {
  const [state, dispatch] = useReducer(stockReducer, initialState);

  // init
  useEffect(() => {
    const products = productRepo.getAll();
    const movements = movementRepo.getAll();
    dispatch({ type: ActionType.INIT, payload: { products, movements } });
  }, []);

  // persist
  useEffect(() => {
    // Evitar guardar mientras no haya init
    if (!state.products.length && !state.movements.length) return;
    productRepo.saveAll(state.products);
    movementRepo.saveAll(state.movements);
  }, [state.products, state.movements]);

  const api = useMemo(() => ({ state, dispatch }), [state]);

  return <StockContext.Provider value={api}>{children}</StockContext.Provider>;
}

export function useStockContext() {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStockContext debe usarse dentro de StockProvider");
  return ctx;
}

import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { productRepo } from "../data/productRepo.js";
import { movementRepo } from "../data/movementRepo.js";
import { stockReducer, initialState } from "./stockReducer.js";
import { ActionType } from "./actions.js";
import { clearAuth, readAuth, writeAuth } from "../data/storage.js";
import { authenticate } from "../domain/auth.js";

const StockContext = createContext(null);

export function StockProvider({ children }) {
  const [state, dispatch] = useReducer(stockReducer, initialState);
  const [auth, setAuth] = useState(() => {
    const stored = readAuth(null);
    if (!stored?.username || !stored?.role) return null;
    return stored;
  });

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

  function login(username, password) {
    const session = authenticate(username, password);
    if (!session) {
      return { ok: false, error: "Usuario o contrasena incorrectos." };
    }
    setAuth(session);
    writeAuth(session);
    return { ok: true };
  }

  function logout() {
    setAuth(null);
    clearAuth();
  }

  const role = auth?.role ?? null;

  const api = useMemo(
    () => ({ state, dispatch, auth, role, login, logout }),
    [state, auth, role]
  );

  return <StockContext.Provider value={api}>{children}</StockContext.Provider>;
}

export function useStockContext() {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStockContext debe usarse dentro de StockProvider");
  return ctx;
}

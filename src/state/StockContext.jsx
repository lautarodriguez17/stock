import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { getLocalRepositories } from "../repositories/repositoryAdapter.js";
import { stockReducer, initialState } from "./stockReducer.js";
import { ActionType } from "./actions.js";
import { clearAuth, readAuth, writeAuth } from "../data/storage.js";
import { authenticate } from "../domain/auth.js";

const StockContext = createContext(null);

export function StockProvider({ children }) {
  const repositories = useMemo(() => getLocalRepositories(), []);
  const [state, baseDispatch] = useReducer(stockReducer, initialState);
  const [auth, setAuth] = useState(() => {
    const stored = readAuth(null);
    if (!stored?.username || !stored?.role) return null;
    return stored;
  });

  // init
  useEffect(() => {
    const products = repositories.products.getAll();
    const movements = repositories.movements.getAll();
    baseDispatch({ type: ActionType.INIT, payload: { products, movements } });
  }, [repositories]);

  const dispatch = useCallback((action) => {
    baseDispatch(action);
    if (action?.type === ActionType.ADD_MOVEMENT && action.payload) {
      repositories.movements.saveAll([action.payload]);
    }
  }, [repositories]);

  // persist products
  useEffect(() => {
    if (!state.products.length) return;
    repositories.products.saveAll(state.products);
  }, [repositories, state.products]);

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
    [state, dispatch, auth, role]
  );

  return <StockContext.Provider value={api}>{children}</StockContext.Provider>;
}

export function useStockContext() {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStockContext debe usarse dentro de StockProvider");
  return ctx;
}

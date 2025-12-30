import { useState } from "react";
import { useStockContext } from "../state/StockContext.jsx";
import { ActionType } from "../state/actions.js";
import { validateMovement } from "../domain/validations.js";

const uid = () => (crypto?.randomUUID?.() ? crypto.randomUUID() : String(Date.now() + Math.random()));

export function useMovements() {
  const { state, dispatch } = useStockContext();
  const [errorList, setErrorList] = useState([]);

  function addMovement(input) {
    const movement = {
      id: uid(),
      productId: input.productId,
      type: input.type,
      qty: Number(input.qty),
      note: (input.note || "").trim(),
      user: "Admin",
      atISO: new Date().toISOString()
    };

    const errors = validateMovement(movement, state.products);
    setErrorList(errors);
    if (errors.length) return false;

    dispatch({ type: ActionType.ADD_MOVEMENT, payload: movement });
    return true;
  }

  return {
    movements: state.movements,
    addMovement,
    errorList
  };
}

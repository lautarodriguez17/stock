import { useState } from "react";
import { useStockContext } from "../state/StockContext.jsx";
import { ActionType } from "../state/actions.js";
import { validateMovement } from "../domain/validations.js";
import { computeStock } from "../domain/stock.js";
import { MovementType } from "../domain/types.js";
import { can, PermissionAction } from "../domain/permissions.js";

const uid = () => (crypto?.randomUUID?.() ? crypto.randomUUID() : String(Date.now() + Math.random()));

export function useMovements() {
  const { state, dispatch, role } = useStockContext();
  const [errorList, setErrorList] = useState([]);

  function addMovement(input) {
    const permissionByType = {
      [MovementType.IN]: PermissionAction.MOVEMENT_CREATE_IN,
      [MovementType.OUT]: PermissionAction.MOVEMENT_CREATE_OUT,
      [MovementType.ADJUST]: PermissionAction.MOVEMENT_CREATE_ADJUST
    };
    const requiredPermission = permissionByType[input.type];
    if (requiredPermission && !can(role, requiredPermission)) {
      const errors = ["No tienes permiso para registrar este movimiento."];
      setErrorList(errors);
      alert(errors[0]);
      return false;
    }

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

    // Evitar ventas con stock insuficiente
    if (movement.type === MovementType.OUT) {
      const stockById = computeStock(state.products, state.movements);
      const available = stockById[movement.productId] ?? 0;
      if (movement.qty > available) {
        errors.push(`No puedes vender ${movement.qty} u. porque solo hay ${available} en stock.`);
      }
    }

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

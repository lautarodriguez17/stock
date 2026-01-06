import React from "react";
import Card from "../components/Card.jsx";
import MovementForm from "../components/MovementForm.jsx";
import MovementTable from "../components/MovementTable.jsx";
import { useStockContext } from "../state/StockContext.jsx";
import { useMovements } from "../hooks/useMovements.js";
import { useStock } from "../hooks/useStock.js";
import { MovementType } from "../domain/types.js";
import { can, PermissionAction } from "../domain/permissions.js";

const TOAST_DURATION_MS = 7000;
const TOAST_ANIM_MS = 240;

export default function MovementsPage({ defaultType, onGoToRestock }) {
  const { state, role } = useStockContext();
  const { addMovement, errorList, movements } = useMovements();
  const { stockById } = useStock();
  const canViewAll = can(role, PermissionAction.MOVEMENTS_VIEW_ALL);
  const canGoToRestock = can(role, PermissionAction.MOVEMENT_CREATE_IN);
  const allowedTypes = React.useMemo(() => {
    const types = [];
    if (can(role, PermissionAction.MOVEMENT_CREATE_OUT)) types.push(MovementType.OUT);
    if (can(role, PermissionAction.MOVEMENT_CREATE_IN)) types.push(MovementType.IN);
    if (can(role, PermissionAction.MOVEMENT_CREATE_ADJUST)) types.push(MovementType.ADJUST);
    return types.length ? types : [MovementType.OUT];
  }, [role]);
  const visibleMovements = canViewAll
    ? movements
    : movements.filter((movement) => movement.type === MovementType.OUT);

  const [stockToast, setStockToast] = React.useState(null);
  const [isClosing, setIsClosing] = React.useState(false);
  const autoCloseRef = React.useRef(null);
  const closeRef = React.useRef(null);

  const startClose = React.useCallback(() => {
    if (!stockToast) return;
    setIsClosing(true);
    if (closeRef.current) clearTimeout(closeRef.current);
    closeRef.current = setTimeout(() => {
      setStockToast(null);
      setIsClosing(false);
    }, TOAST_ANIM_MS);
  }, [stockToast]);

  React.useEffect(() => {
    if (!stockToast) return undefined;
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    autoCloseRef.current = setTimeout(() => {
      startClose();
    }, TOAST_DURATION_MS);
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, [stockToast, startClose]);

  React.useEffect(() => () => {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    if (closeRef.current) clearTimeout(closeRef.current);
  }, []);

  function handleLowStockAlert(payload) {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    if (closeRef.current) clearTimeout(closeRef.current);
    setIsClosing(false);
    setStockToast({ ...payload, id: Date.now() });
  }

  function handleGoToRestock() {
    if (!stockToast || !canGoToRestock) return;
    onGoToRestock?.(stockToast.productId);
    startClose();
  }

  return (
    <>
      <div className="grid2">
        <Card title="Registrar movimiento">
          <MovementForm
            products={state.products}
            stockById={stockById}
            onSubmit={addMovement}
            errors={errorList}
            defaultType={defaultType}
            allowedTypes={allowedTypes}
            onLowStockAlert={handleLowStockAlert}
          />
        </Card>

        <Card title="Historial (últimos 50)">
          <MovementTable products={state.products} movements={visibleMovements} />
        </Card>
      </div>

      {stockToast ? (
        <div className="stockToastHost" role="status" aria-live="polite">
          <div
            className={`stockToast ${isClosing ? "isClosing" : ""}`}
            key={stockToast.id}
          >
            <div className="stockToastHeader">
              <span className="stockToastIcon" aria-hidden="true">⚠️</span>
              <span className="stockToastTitle">
                Stock bajo: {stockToast.productName}
              </span>
              <button
                className="stockToastClose"
                type="button"
                aria-label="Cerrar"
                onClick={startClose}
              >
                X
              </button>
            </div>

            <div className="stockToastBody">
              <div className="stockToastText">
                <div className="stockToastLine">
                  Te estás quedando sin stock{" "}
                  <span className="stockToastProduct">{stockToast.productName}</span>
                  {stockToast.sku ? (
                    <span className="stockToastSku">({stockToast.sku})</span>
                  ) : null}
                </div>
                <div className="stockToastLine stockToastSecondary">
                  Te estás quedando sin stock de este producto.
                </div>
                <div className="stockToastMeta">
                  Quedan: {formatCount(stockToast.stock)} (mínimo: {formatCount(stockToast.minStock)})
                </div>
              </div>
            </div>

            {canGoToRestock ? (
              <div className="stockToastActions">
                <button
                  className="stockToastButton"
                  type="button"
                  onClick={handleGoToRestock}
                >
                  Ir a reponer
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function formatCount(n) {
  return Number(n || 0).toLocaleString("es-AR");
}

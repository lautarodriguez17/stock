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
const TIME_FILTERS = [
  { key: "today", label: "Hoy" },
  { key: "7d", label: "7 días" },
  { key: "30d", label: "30 días" },
  { key: "all", label: "Todo" }
];

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
  const [timeFilter, setTimeFilter] = React.useState("all");
  const now = new Date();
  const timeRange = buildTimeRange(timeFilter, now);
  const filteredMovements = filterMovementsByRange(visibleMovements, timeRange);

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
          <div className="movementFilters">
            <div className="movementFilterTabs" role="group" aria-label="Filtrar movimientos por rango">
              {TIME_FILTERS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`movementFilterTab ${timeFilter === tab.key ? "isActive" : ""}`}
                  aria-pressed={timeFilter === tab.key}
                  onClick={() => setTimeFilter(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="movementRangeLabel" aria-live="polite">
              {timeRange.label}
            </div>
          </div>
          <MovementTable products={state.products} movements={filteredMovements} />
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

function buildTimeRange(filterKey, now) {
  if (filterKey === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return {
      start,
      end: now,
      label: `Rango: ${formatDate(start)} ${formatTime(start)} → ahora`
    };
  }

  if (filterKey === "7d" || filterKey === "30d") {
    const days = filterKey === "7d" ? 7 : 30;
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return {
      start,
      end: now,
      label: `Rango: ${formatDate(start)} → ${formatDate(now)}`
    };
  }

  return {
    start: null,
    end: now,
    label: "Rango: todo el historial"
  };
}

function filterMovementsByRange(movements, range) {
  if (!range?.start) return movements;
  const startMs = range.start.getTime();
  const endMs = range.end.getTime();
  return movements.filter((movement) => {
    const when = getMovementDate(movement);
    if (!when) return false;
    const time = when.getTime();
    return time >= startMs && time <= endMs;
  });
}

function getMovementDate(movement) {
  if (!movement) return null;
  const value = movement.atISO || movement.createdAt;
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatDate(date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`;
}

function formatTime(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

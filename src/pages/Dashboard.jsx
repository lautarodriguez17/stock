import React, { useMemo } from "react";
import { useStockContext } from "../state/StockContext.jsx";
import { useStock } from "../hooks/useStock.js";
import Table from "../components/Table.jsx";
import { MovementType } from "../domain/types.js";
import { can, PermissionAction } from "../domain/permissions.js";

export default function Dashboard({ onGoToProducts, onGoToMovements, onViewProduct, onRestockProduct }) {
  const { state, role } = useStockContext();
  const { stockById, metrics } = useStock();
  const canCreateProduct = can(role, PermissionAction.PRODUCT_CREATE);
  const canCreatePurchase = can(role, PermissionAction.MOVEMENT_CREATE_IN);

  const lowProducts = state.products
    .filter((p) => p.active !== false)
    .map((p) => ({
      ...p,
      stock: stockById[p.id] ?? 0
    }))
    .filter((p) => p.stock <= (p.minStock ?? 0))
    .sort((a, b) => a.stock - b.stock);

  const missingUnits = lowProducts.reduce((sum, product) => {
    const minStock = product.minStock ?? 0;
    const diff = minStock - (product.stock ?? 0);
    return diff > 0 ? sum + diff : sum;
  }, 0);

  const todayStats = useMemo(
    () => computeTodayStats(state.movements, state.products),
    [state.movements, state.products]
  );

  const recentMovements = useMemo(
    () => buildRecentMovements(state.movements, state.products, 8),
    [state.movements, state.products]
  );

  const salesHistory = useMemo(
    () => computeSalesHistory(state.movements, state.products),
    [state.movements, state.products]
  );

  const salesPeriods = [
    { key: "daily", label: "Diaria", data: salesHistory.daily },
    { key: "weekly", label: "Semanal", data: salesHistory.weekly },
    { key: "monthly", label: "Mensual", data: salesHistory.monthly }
  ];

  return (
    <div className="dashboardPage">
      <section className="alertCard">
        <div className="alertTop">
          <div className="alertLabel">
            <span className="alertIcon" aria-hidden="true">⚠️</span>
            <span>Stock crítico ({lowProducts.length})</span>
          </div>
          <span className="alertChevron" aria-hidden="true">›</span>
        </div>

        <div className="alertBody">
          {lowProducts.length ? (
            <div className={`criticalList ${lowProducts.length > 3 ? "isScrollable" : ""}`}>
              {lowProducts.map((criticalProduct) => (
                <div className="criticalRow" key={criticalProduct.id}>
                  <div className="productInfo">
                    <div className="productTitle">
                      <span>{criticalProduct.name}</span>
                      {criticalProduct.sku ? <span className="muted">({criticalProduct.sku})</span> : null}
                      <span className="badgeCritical">Stock crítico</span>
                    </div>
                    <div className="muted">{criticalProduct.category || "Sin categoría"}</div>
                    <div className="stockRow">
                      <span>Stock actual: <span className="value">{criticalProduct.stock}</span></span>
                      <span>Mínimo: <span className="value">{criticalProduct.minStock ?? 0}</span></span>
                      <span className="missing">
                        Faltan: <span className="value">{missingCount(criticalProduct)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="criticalActions">
                    {canCreatePurchase ? (
                      <button
                        className="btnCTA"
                        type="button"
                        onClick={() => onRestockProduct?.(criticalProduct.id)}
                      >
                        Agregar a reposición
                      </button>
                    ) : null}
                    <button
                      className="btnGhost"
                      type="button"
                      onClick={() => onViewProduct?.(criticalProduct.id)}
                    >
                      Ver producto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="criticalEmpty">
              <span role="img" aria-label="ok">✅</span> Todo en orden. No hay productos en stock crítico.
            </div>
          )}
        </div>
      </section>

      <section className="infoCard todayCard">
        <h3 className="infoTitle">Hoy / Turno actual</h3>
        <div className="todayGrid">
          <div className="todayItem isSales">
            <span className="todayLabel">Ventas de hoy</span>
            <span className="todayValue">{money(todayStats.sales)}</span>
          </div>
          <div className="todayItem">
            <span className="todayLabel">Items vendidos</span>
            <span className="todayValue">{formatCount(todayStats.itemsSold)}</span>
          </div>
          <div className="todayItem">
            <span className="todayLabel">Movimientos hoy</span>
            <span className="todayValue">{formatCount(todayStats.movements)}</span>
          </div>
          <div className="todayItem isActivity">
            <span className="todayLabel">Última actividad</span>
            <span className="todayValue todayValueActivity">{todayStats.lastActivity}</span>
          </div>
        </div>
      </section>

      <div className="summaryGrid">
        <section className="infoCard summaryCard">
          <h3 className="infoTitle">Resumen Operativo</h3>
          <div className="summaryCompact">
            <div className="summaryColumn">
              <div className="summaryRow isNeutral">
                <span className="summaryIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="presentation">
                    <path
                      d="M3 7l9-4 9 4-9 4-9-4z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="summaryLabel">Productos activos</span>
                <span className="summaryValue">{formatCount(metrics.totalProducts)}</span>
              </div>
           <div className="summaryRow isMissing">
                <span className="summaryIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="presentation">
                    <path
                      d="M3 7l9-4 9 4-9 4-9-4z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 14h8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="summaryLabel">Faltan</span>
                <span className="summaryValue">{formatCount(missingUnits)}</span>
              </div>
            </div>

            <div className="summaryColumn">
              <div className="summaryRow isAlert">
                <span className="summaryIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" role="presentation">
                    <path
                      d="M12 3l10 18H2L12 3z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 9v5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="17" r="1.1" fill="currentColor" />
                  </svg>
                </span>
                <span className="summaryLabel">Con stock bajo</span>
                <span className="summaryValue">{formatCount(metrics.lowStockCount)}</span>
              </div>
            
            </div>
          </div>
        </section>

        <section className="infoCard">
          <h3 className="infoTitle">Capital en Stock</h3>
          <div className="capitalPanel">
            <div className="capitalMetric isCost">
              <span className="capitalIcon isCost" aria-hidden="true">$</span>
              <div className="capitalText">
                <div className="capitalLabel">Costo total</div>
                <div className="capitalValue">{money(metrics.valuation)}</div>
              </div>
            </div>

            <div className="capitalDivider" aria-hidden="true" />

            <div className="capitalMetric isGross">
              <span className="capitalIcon isGross" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="presentation">
                  <path
                    d="M9 3h6l1 3H8l1-3z"
                    fill="currentColor"
                  />
                  <path
                    d="M7 6h10l2 4-2 9H7L5 10l2-4z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 10c-1.2 0-2 .6-2 1.6 0 1.1 1 1.5 2.1 1.8 1 .3 1.4.5 1.4 1 0 .5-.5.9-1.3.9-.8 0-1.5-.3-2-.7"
                    fill="none"
                    stroke="#f8fafc"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <div className="capitalText">
                <div className="capitalLabel">Ganancia bruta</div>
                <div className="capitalValue">{money(metrics.grossSales)}</div>
              </div>
            </div>

            <div className="capitalDivider" aria-hidden="true" />

            <div className="capitalMetric isNet">
              <span className="capitalIcon isNet" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="presentation">
                  <path
                    d="M4 19V9m6 10v-5m6 5v-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 9l6-4 4 3 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 2v4h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="capitalText">
                <div className="capitalLabel">Ganancia</div>
                <div className="capitalValue">{money(metrics.potentialMargin)}</div>
              </div>
            </div>
          </div>
          <p className="muted">Estimado sobre productos activos</p>
        </section>
      </div>

      <section className="infoCard activityCard">
        <div className="activityHeader">
          <h3 className="infoTitle">Actividad reciente</h3>
          <span className="muted">Últimos movimientos</span>
        </div>
        <Table
          columns={activityColumns}
          rows={recentMovements}
          emptyText="Sin movimientos recientes."
          maxHeight="260px"
          scrollThreshold={6}
        />
      </section>

      <section>
        <h3 className="infoTitle">Historial de ventas</h3>
        <div className="summaryGrid">
          {salesPeriods.map((period) => {
            const netProfit = period.data.sales - period.data.costs;

            return (
              <div className="infoCard" key={period.key}>
                <h4 className="infoTitle">{period.label}</h4>
                 <div className="infoItem">
                  Ganancia neta: <strong className="metricValue metricNet">{money(netProfit)}</strong>
                </div>
                <div className="infoItem">
                  Ganancia bruta: <strong className="metricValue metricGross">{money(period.data.sales)}</strong>
                </div>
                {/* <div className="infoItem">
                  Costos: <strong className="metricValue metricCosts">{money(period.data.costs)}</strong>
                </div> */}
               
              </div>
            );
          })}
        </div>
      </section>

      <section className="quickActionsCard">
        <h3 className="infoTitle">Acciones Rápidas</h3>
        <div className="quickButtons">
          {canCreateProduct ? (
            <button className="quickButton green" type="button" onClick={onGoToProducts}>
              + Agregar producto
            </button>
          ) : null}
          {canCreatePurchase ? (
            <button
              className="quickButton red"
              type="button"
              onClick={() => onGoToMovements?.(MovementType.IN)}
            >
              + Registrar compra
            </button>
          ) : null}
          <button
            className="quickButton blue"
            type="button"
            onClick={() => onGoToMovements?.(MovementType.OUT)}
          >
            + Registrar venta
          </button>
        </div>
      </section>
    </div>
  );
}

const activityColumns = [
  { key: "time", header: "Hora" },
  { key: "product", header: "Producto" },
  {
    key: "type",
    header: "Tipo",
    render: (row) => (
      <span className={`movementType movement${row.type || ""}`}>{row.type}</span>
    )
  },
  {
    key: "qty",
    header: "Cantidad",
    render: (row) => formatCount(row.qty)
  }
];

function money(n) {
  return Number(n || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
}

function formatCount(n) {
  return Number(n || 0).toLocaleString("es-AR");
}

function missingCount(product) {
  const minStock = product.minStock ?? 0;
  const diff = minStock - (product.stock ?? 0);
  return diff > 0 ? diff : 0;
}

function computeTodayStats(movements, products) {
  const safeMovements = Array.isArray(movements) ? movements : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const productById = Object.fromEntries(safeProducts.map((p) => [p.id, p]));

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  let sales = 0;
  let itemsSold = 0;
  let movementsCount = 0;
  let lastMovement = null;
  let lastMovementAt = null;

  for (const movement of safeMovements) {
    const when = new Date(movement.atISO);
    if (Number.isNaN(when.getTime())) continue;

    if (!lastMovementAt || when > lastMovementAt) {
      lastMovementAt = when;
      lastMovement = movement;
    }

    if (when < startOfDay) continue;
    movementsCount += 1;

    if (movement.type === MovementType.OUT) {
      const qty = Number(movement.qty ?? 0);
      itemsSold += qty;
      const product = productById[movement.productId];
      if (product) {
        sales += (product.price ?? 0) * qty;
      }
    }
  }

  return {
    sales,
    itemsSold,
    movements: movementsCount,
    lastActivity: buildLastActivityLabel(lastMovement, lastMovementAt, now)
  };
}

function buildRecentMovements(movements, products, limit) {
  const safeMovements = Array.isArray(movements) ? movements : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const productById = Object.fromEntries(safeProducts.map((p) => [p.id, p]));
  const rows = safeMovements
    .map((movement) => {
      const time = new Date(movement.atISO);
      const timeValue = Number.isNaN(time.getTime()) ? null : time;
      return {
        ...movement,
        _time: timeValue ? timeValue.getTime() : 0
      };
    })
    .sort((a, b) => b._time - a._time)
    .slice(0, limit)
    .map((movement) => {
      const time = movement._time
        ? new Date(movement._time).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
        : "--:--";
      const productName = productById[movement.productId]?.name || "Producto eliminado";
      return {
        id: movement.id || `${movement.productId}-${movement.atISO}`,
        time,
        product: productName,
        type: movement.type,
        qty: Number(movement.qty ?? 0)
      };
    });

  return rows;
}

function buildLastActivityLabel(movement, when, now) {
  if (!movement || !when) return "Sin actividad";
  const action = movement.type === MovementType.OUT
    ? "Última venta"
    : movement.type === MovementType.IN
      ? "Última compra"
      : "Último ajuste";
  return `${action} ${formatTimeAgo(when, now)}`;
}

function formatTimeAgo(when, now) {
  const diffMs = Math.max(0, now - when);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "hace instantes";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

function computeSalesHistory(movements, products) {
  const safeProducts = Array.isArray(products) ? products : [];
  const safeMovements = Array.isArray(movements) ? movements : [];
  const productById = Object.fromEntries(safeProducts.map((p) => [p.id, p]));

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(startOfDay);
  const dayOfWeek = startOfWeek.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = {
    daily: createSalesBucket(),
    weekly: createSalesBucket(),
    monthly: createSalesBucket()
  };

  for (const movement of safeMovements) {
    if (movement.type !== MovementType.OUT) continue;
    const product = productById[movement.productId];
    if (!product) continue;

    const when = new Date(movement.atISO);
    if (Number.isNaN(when.getTime())) continue;

    const qty = Number(movement.qty ?? 0);
    const sales = (product.price ?? 0) * qty;
    const costs = (product.cost ?? 0) * qty;

    if (when >= startOfDay) addSale(result.daily, sales, costs);
    if (when >= startOfWeek) addSale(result.weekly, sales, costs);
    if (when >= startOfMonth) addSale(result.monthly, sales, costs);
  }

  return result;
}

function createSalesBucket() {
  return { sales: 0, costs: 0 };
}

function addSale(bucket, sales, costs) {
  bucket.sales += sales;
  bucket.costs += costs;
}

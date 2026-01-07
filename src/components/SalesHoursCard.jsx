import React from "react";
import { buildHourlyBuckets } from "../analytics/hours.js";

const PERIOD_TABS = [
  { key: "today", label: "Hoy" },
  { key: "7d", label: "7 días" },
  { key: "30d", label: "30 días" }
];

const METRIC_TABS = [
  { key: "sales", label: "Ventas" },
  { key: "units", label: "Unidades" }
];

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

export default function SalesHoursCard({ movements }) {
  const [period, setPeriod] = React.useState("today");
  const [metric, setMetric] = React.useState("sales");
  const [selectedHour, setSelectedHour] = React.useState(null);

  const analytics = React.useMemo(() => {
    const now = new Date();
    const { start, end } = buildRange(period, now);
    const buckets = buildHourlyBuckets(movements, start, end);
    const peakHourForMetric = metric === "sales" ? buckets.peakHour : buckets.peakUnitsHour;
    const peakValue = metric === "sales" ? buckets.peakSalesValue : buckets.peakUnitsValue;
    const metricValues = metric === "sales" ? buckets.salesByHour : buckets.unitsByHour;
    const maxValue = peakValue > 0 ? peakValue : 1;

    return {
      ...buckets,
      peakHourForMetric,
      peakValue,
      metricValues,
      maxValue
    };
  }, [movements, period, metric]);

  React.useEffect(() => {
    setSelectedHour(null);
  }, [period]);

  React.useEffect(() => {
    if (analytics.totalSales === 0) {
      setSelectedHour(null);
    }
  }, [analytics.totalSales]);

  const hasSales = analytics.totalSales > 0;
  const activeHour = hasSales ? (selectedHour ?? analytics.peakHourForMetric) : null;
  const peakHourLabel = hasSales ? formatHour(analytics.peakHourForMetric) : "--:--";
  const peakMetricLabel = metric === "sales" ? "Ventas" : "Unidades";
  const totalLabel = metric === "sales"
    ? `${formatCount(analytics.totalSales)} ventas / ${formatCount(analytics.totalUnits)} unidades`
    : `${formatCount(analytics.totalUnits)} unidades / ${formatCount(analytics.totalSales)} ventas`;
  const selected = activeHour === null
    ? null
    : {
        hour: activeHour,
        sales: analytics.salesByHour[activeHour],
        units: analytics.unitsByHour[activeHour]
      };

  return (
    <section className="infoCard salesHoursCard">
      <div className="salesHoursHeader">
        <div>
          <h3 className="infoTitle">Horarios de venta</h3>
          <span className="muted">Distribución por hora</span>
        </div>

        <div className="salesHoursControls">
          <div className="salesHoursTabs" role="group" aria-label="Periodo">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`salesHoursTab ${period === tab.key ? "isActive" : ""}`}
                aria-pressed={period === tab.key}
                onClick={() => setPeriod(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="salesHoursToggle" role="group" aria-label="Metrica">
            {METRIC_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`salesHoursToggleBtn ${metric === tab.key ? "isActive" : ""}`}
                aria-pressed={metric === tab.key}
                onClick={() => setMetric(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="salesHoursSummary">
        <div className="salesHoursSummaryItem">
          <span className="salesHoursSummaryLabel">Hora pico</span>
          <span className="salesHoursSummaryValue">
            {peakHourLabel}
            <span className="salesHoursSummarySecondary">
              ({peakMetricLabel}: {formatCount(hasSales ? analytics.peakValue : 0)})
            </span>
          </span>
        </div>
        <div className="salesHoursSummaryItem">
          <span className="salesHoursSummaryLabel">Total del período</span>
          <span className="salesHoursSummaryValue">{totalLabel}</span>
        </div>
      </div>

      {!hasSales ? (
        <div className="salesHoursEmpty">No hay ventas registradas en este período.</div>
      ) : (
        <>
          <div className="salesHoursChart">
            <div className="salesHoursValues" aria-hidden="true">
              {HOURS.map((hour) => {
                const value = analytics.metricValues[hour];
                const isSelected = activeHour === hour;
                return (
                  <span
                    key={hour}
                    className={`salesHoursValue ${isSelected ? "isSelected" : ""} ${value === 0 ? "isZero" : ""}`}
                  >
                    {formatCount(value)}
                  </span>
                );
              })}
            </div>
            <div className="salesHoursBars" role="list">
              {HOURS.map((hour) => {
                const value = analytics.metricValues[hour];
                const fillStyle = value === 0
                  ? { height: "2px" }
                  : {
                      height: `${(value / analytics.maxValue) * 100}%`,
                      minHeight: "6px"
                    };
                const isPeak = hour === analytics.peakHourForMetric && analytics.peakValue > 0;
                const isSelected = activeHour === hour;

                return (
                  <div
                    key={hour}
                    className={`salesHoursBar ${isPeak ? "isPeak" : ""} ${isSelected ? "isSelected" : ""}`}
                  >
                    <button
                      type="button"
                      className="salesHoursBarButton"
                      aria-pressed={isSelected}
                      aria-label={`Hora ${formatHour(hour)}. Ventas: ${formatCount(analytics.salesByHour[hour])}. Unidades: ${formatCount(analytics.unitsByHour[hour])}.`}
                      title={`${formatHour(hour)} — Ventas: ${formatCount(analytics.salesByHour[hour])} — Unidades: ${formatCount(analytics.unitsByHour[hour])}`}
                      onClick={() => setSelectedHour(hour)}
                    >
                      <span className="salesHoursBarFill" style={fillStyle} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="salesHoursAxis" aria-hidden="true">
              {HOURS.map((hour) => {
                const isLabel = hour % 3 === 0;
                return (
                  <span
                    key={hour}
                    className={`salesHoursAxisLabel ${isLabel ? "isVisible" : ""}`}
                  >
                    {isLabel ? formatHourLabel(hour) : ""}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="salesHoursSelection">
            {selected
              ? `Hora seleccionada: ${formatHour(selected.hour)} — Ventas: ${formatCount(selected.sales)} — Unidades: ${formatCount(selected.units)}`
              : ""}
          </div>
        </>
      )}
    </section>
  );
}

function buildRange(period, now) {
  const end = now;
  if (period === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }
  const days = period === "7d" ? 7 : 30;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

function formatHour(hour) {
  return `${pad2(hour)}:00`;
}

function formatHourLabel(hour) {
  return pad2(hour);
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function formatCount(value) {
  return Number(value || 0).toLocaleString("es-AR");
}

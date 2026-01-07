const HOURS_IN_DAY = 24;
const MS_IN_SECOND = 1000;

export function getMovementDate(movement) {
  if (!movement) return null;
  const candidates = [
    movement.createdAt,
    movement.datetime,
    movement.date,
    movement.timestamp,
    movement.atISO
  ];

  for (const value of candidates) {
    const parsed = parseDateValue(value);
    if (parsed) return parsed;
  }

  return null;
}

export function buildHourlyBuckets(movements, start, end) {
  const salesByHour = Array.from({ length: HOURS_IN_DAY }, () => 0);
  const unitsByHour = Array.from({ length: HOURS_IN_DAY }, () => 0);
  const safeMovements = Array.isArray(movements) ? movements : [];
  const startMs = start instanceof Date ? start.getTime() : new Date(start).getTime();
  const endMs = end instanceof Date ? end.getTime() : new Date(end).getTime();

  let totalSales = 0;
  let totalUnits = 0;

  for (const movement of safeMovements) {
    if (movement?.type !== "OUT") continue;
    const when = getMovementDate(movement);
    if (!when) continue;
    const time = when.getTime();
    if (Number.isNaN(time)) continue;
    if (time < startMs || time > endMs) continue;

    const hour = when.getHours();
    const qty = Number(movement.qty ?? 0) || 0;
    salesByHour[hour] += 1;
    unitsByHour[hour] += qty;
    totalSales += 1;
    totalUnits += qty;
  }

  const peakSales = findPeakHour(salesByHour);
  const peakUnits = findPeakHour(unitsByHour);

  return {
    salesByHour,
    unitsByHour,
    totalSales,
    totalUnits,
    peakHour: peakSales.hour,
    peakSalesValue: peakSales.value,
    peakUnitsValue: peakUnits.value,
    peakUnitsHour: peakUnits.hour
  };
}

function parseDateValue(value) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    return parseEpoch(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return parseEpoch(numeric);
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function parseEpoch(value) {
  if (!Number.isFinite(value)) return null;
  const ms = value < 1e12 ? value * MS_IN_SECOND : value;
  const parsed = new Date(ms);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function findPeakHour(values) {
  let max = -Infinity;
  let hour = 0;
  values.forEach((value, index) => {
    if (value > max) {
      max = value;
      hour = index;
    }
  });
  if (!Number.isFinite(max)) return { hour: 0, value: 0 };
  return { hour, value: max };
}

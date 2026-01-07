import { readJSON, writeJSON } from "./storage.js";
import { seedMovements } from "./seeds.js";
import { getMovementDate } from "../analytics/hours.js";

const KEY = "movements";
const MAX_MOVEMENTS = 2000;

export const movementRepo = {
  getAll() {
    const movements = readJSON(KEY, null);
    if (!movements) {
      const seeded = seedMovements();
      writeJSON(KEY, seeded);
      return seeded;
    }
    if (!Array.isArray(movements)) return movements;

    let hasChanges = false;
    const normalized = movements.map((movement) => {
      const when = getMovementDate(movement);
      if (when) return movement;
      hasChanges = true;
      return { ...movement, createdAt: Date.now() };
    });
    const trimmed = normalized.length > MAX_MOVEMENTS
      ? normalized.slice(0, MAX_MOVEMENTS)
      : normalized;
    if (trimmed.length !== normalized.length) {
      hasChanges = true;
    }

    if (hasChanges) {
      try {
        writeJSON(KEY, trimmed);
      } catch (error) {
        if (!isQuotaExceeded(error)) {
          throw error;
        }
      }
    }

    return trimmed;
  },

  saveAll(movements) {
    const trimmed = Array.isArray(movements)
      ? movements.slice(0, MAX_MOVEMENTS)
      : movements;
    try {
      writeJSON(KEY, trimmed);
    } catch (error) {
      if (!isQuotaExceeded(error) || !Array.isArray(trimmed)) {
        throw error;
      }
      const fallbackSize = Math.max(200, Math.floor(trimmed.length / 2));
      const fallback = trimmed.slice(0, fallbackSize);
      try {
        writeJSON(KEY, fallback);
      } catch (innerError) {
        if (!isQuotaExceeded(innerError)) {
          throw innerError;
        }
      }
    }
  }
};

function isQuotaExceeded(error) {
  if (!error) return false;
  return (
    error.name === "QuotaExceededError"
    || error.name === "NS_ERROR_DOM_QUOTA_REACHED"
    || error.code === 22
  );
}

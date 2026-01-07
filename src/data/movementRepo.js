import { readJSON, writeJSON } from "./storage.js";
import { seedMovements } from "./seeds.js";
import { getMovementDate } from "../analytics/hours.js";

const KEY = "movements";

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

    if (hasChanges) {
      writeJSON(KEY, normalized);
    }

    return normalized;
  },

  saveAll(movements) {
    writeJSON(KEY, movements);
  }
};

import { readJSON, writeJSON } from "./storage.js";
import { seedMovements } from "./seeds.js";

const KEY = "movements";

export const movementRepo = {
  getAll() {
    const movements = readJSON(KEY, null);
    if (!movements) {
      const seeded = seedMovements();
      writeJSON(KEY, seeded);
      return seeded;
    }
    return movements;
  },

  saveAll(movements) {
    writeJSON(KEY, movements);
  }
};

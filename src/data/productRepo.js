import { readJSON, writeJSON } from "./storage.js";
import { seedProducts } from "./seeds.js";

const KEY = "products";

export const productRepo = {
  getAll() {
    const products = readJSON(KEY, null);
    if (!products) {
      const seeded = seedProducts();
      writeJSON(KEY, seeded);
      return seeded;
    }
    return products;
  },

  saveAll(products) {
    writeJSON(KEY, products);
  }
};

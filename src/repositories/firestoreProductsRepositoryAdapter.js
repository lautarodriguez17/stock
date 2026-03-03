import { firestoreProductsRepository } from "./firestoreProductsRepository.js";

const TENANT_ID = "kiosco";


const cache = [];
const knownIds = new Set();
let isLoading = false;
let hasLoaded = false;

function toStringOrEmpty(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toNumberOrZero(value) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function toCanonicalProduct(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: toStringOrEmpty(raw.id),
    name: toStringOrEmpty(raw.name),
    sku: toStringOrEmpty(raw.sku ?? raw.SKU),
    category: toStringOrEmpty(raw.category),
    cost: toNumberOrZero(raw.cost),
    price: toNumberOrZero(raw.price),
    stock: toNumberOrZero(raw.stock),
    stockMin: toNumberOrZero(raw.stockMin ?? raw.stockMin),
    active: raw.active ?? true
  };
}

function setCache(items) {
  cache.length = 0;
  cache.push(...items);
}

async function loadFromFirestore() {
  if (isLoading || hasLoaded) return;
  isLoading = true;
  try {
    const docs = await firestoreProductsRepository.getAll(TENANT_ID);
    const normalized = Array.isArray(docs)
      ? docs.map(toCanonicalProduct).filter(Boolean)
      : [];
    setCache(normalized);
    normalized.forEach((product) => {
      if (product?.id) knownIds.add(product.id);
    });
    hasLoaded = true;
  } catch (error) {
    console.error("❌ [FirestoreProductsAdapter] Failed to load Firestore products", error);
  } finally {
    isLoading = false;
  }
}

function getAll() {
  if (!hasLoaded && !isLoading) {
    void loadFromFirestore();
  }
  return cache;
}

function saveAll(products) {
  if (!Array.isArray(products)) return;
  const normalized = products.map(toCanonicalProduct).filter(Boolean);
  setCache(normalized);
  if (normalized.length) {
    const sample = normalized[0];
    console.log("[FirestoreProductsAdapter] sample:", {
      id: sample.id,
      sku: sample.sku,
      stock: sample.stock,
      stockMin: sample.stockMin
    });
  }

  normalized.forEach((product) => {
    const id = product?.id;
    if (!id) return;
    const write = knownIds.has(id)
      ? firestoreProductsRepository.update(TENANT_ID, id, product)
      : firestoreProductsRepository.create(TENANT_ID, product);
    void write
      .then(() => {
        knownIds.add(id);
      })
      .catch((error) => {
        console.error("❌ [FirestoreProductsAdapter] Failed to save product", error);
        if (knownIds.has(id)) return;
        return firestoreProductsRepository.create(TENANT_ID, product).catch((innerError) => {
          console.error("❌ [FirestoreProductsAdapter] Retry create failed", innerError);
        });
      });
  });
}

export const firestoreProductsRepositoryAdapter = {
  getAll,
  saveAll
};

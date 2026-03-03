import { firestoreMovementsRepository } from "./firestoreMovementsRepository.js";
import { firestoreProductsRepository } from "./firestoreProductsRepository.js";
import { increment } from "firebase/firestore";

const TENANT_ID = "kiosco";

const cache = [];
const knownIds = new Set();
const inFlightIds = new Set();
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

function toNormalizedMovement(raw) {
  if (!raw || typeof raw !== "object") return null;

  return {
    id: toStringOrEmpty(raw.id),
    productId: toStringOrEmpty(raw.productId),
    type: toStringOrEmpty(raw.type),
    qty: toNumberOrZero(raw.qty),
    note: toStringOrEmpty(raw.note),
    user: toStringOrEmpty(raw.user),
    atISO: raw.atISO || new Date().toISOString()
  };
}

async function updateProductStockForMovement(movement) {
  const { productId, type } = movement;
  const cantidad = Number(movement.qty);

  if (!productId || !type) return;

  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    throw new Error("Cantidad inválida");
  }

  const product = await firestoreProductsRepository.getById(
    TENANT_ID,
    productId
  );

  if (!product) {
    throw new Error("Producto inexistente");
  }

  let stockActual = Number(product.stock);

  // 🔥 SI NO EXISTE STOCK → INICIALIZAR
  if (!Number.isFinite(stockActual)) {
    stockActual = 0;
    await firestoreProductsRepository.update(TENANT_ID, productId, {
      stock: 0
    });
  }

  if (type === "ADJUST") {
    await firestoreProductsRepository.update(TENANT_ID, productId, {
      stock: cantidad
    });
    return;
  }

  const delta = type === "IN" ? cantidad : -cantidad;
  const nuevoStock = stockActual + delta;

  if (nuevoStock < 0) {
    throw new Error("Stock insuficiente");
  }

  await firestoreProductsRepository.update(TENANT_ID, productId, {
    stock: nuevoStock
  });
}

async function loadFromFirestore() {
  if (isLoading || hasLoaded) return;

  isLoading = true;

  try {
    const docs = await firestoreMovementsRepository.getAll(TENANT_ID);
    const fetched = Array.isArray(docs)
      ? docs.map(toNormalizedMovement).filter(Boolean)
      : [];

    fetched.forEach((m) => {
      if (!knownIds.has(m.id)) {
        cache.push(m);
        knownIds.add(m.id);
      }
    });

    hasLoaded = true;
  } catch (error) {
    console.error("Load error:", error);
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

function saveAll(movements) {
  if (!Array.isArray(movements)) return;

  movements
    .map(toNormalizedMovement)
    .filter(Boolean)
    .forEach((movement) => {
      const id = movement.id;

      if (!id || knownIds.has(id) || inFlightIds.has(id)) return;

      inFlightIds.add(id);

      void firestoreMovementsRepository
        .create(TENANT_ID, movement)
        .then(async () => {
          cache.push(movement);
          knownIds.add(id);
          await updateProductStockForMovement(movement);
        })
        .catch((err) => {
          console.error("Save error:", err);
        })
        .finally(() => {
          inFlightIds.delete(id);
        });
    });
}

export const firestoreMovementsRepositoryAdapter = {
  getAll,
  saveAll
};
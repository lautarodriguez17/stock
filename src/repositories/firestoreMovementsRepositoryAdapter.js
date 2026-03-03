import { firestoreMovementsRepository } from "./firestoreMovementsRepository.js";
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

function toDateMs(value) {
  if (!value) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value.toDate === "function") {
    const date = value.toDate();
    const time = date?.getTime?.();
    return Number.isFinite(time) ? time : null;
  }
  if (typeof value.seconds === "number") {
    return Math.floor(value.seconds * 1000);
  }
  return null;
}

function toAtIso(raw) {
  const explicit = toStringOrEmpty(raw.atISO);
  if (explicit) return explicit;
  const createdMs = toDateMs(raw.createdAt);
  if (!createdMs) return "";
  return new Date(createdMs).toISOString();
}

function toNormalizedMovement(raw) {
  if (!raw || typeof raw !== "object") return null;
  const createdAtMs = toDateMs(raw.createdAt);
  const movement = {
    id: toStringOrEmpty(raw.id),
    productId: toStringOrEmpty(raw.productId),
    type: toStringOrEmpty(raw.type),
    qty: toNumberOrZero(raw.qty),
    note: toStringOrEmpty(raw.note),
    user: toStringOrEmpty(raw.user),
    atISO: toAtIso(raw)
  };
  if (createdAtMs) movement.createdAt = createdAtMs;
  return movement;
}

function computeNextStock(currentStock, movement) {
  if (!movement) return null;
  const type = movement.type;
  const qty = toNumberOrZero(movement.qty);
  if (!type) return null;
  if (type === "IN") return currentStock + qty;
  if (type === "OUT") return currentStock - qty;
  if (type === "ADJUST") return qty;
  return null;
}

async function updateProductStockForMovement(movement) {
  const productId = movement?.productId;
  if (!productId) return;
  const nextStockFromMovement = computeNextStock(0, movement);
  if (nextStockFromMovement === null) return;

  try {
    const product = await firestoreProductsRepository.getById(TENANT_ID, productId);
    if (!product) return;
    const currentStock = toNumberOrZero(product.stock);
    const nextStock = computeNextStock(currentStock, movement);
    if (nextStock === null) return;
    await firestoreProductsRepository.update(TENANT_ID, productId, { stock: nextStock });
  } catch (error) {
    console.error("[FirestoreMovementsAdapter] Failed to update product stock", error);
  }
}

function toFirestorePayload(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: toStringOrEmpty(raw.id),
    productId: toStringOrEmpty(raw.productId),
    type: toStringOrEmpty(raw.type),
    qty: toNumberOrZero(raw.qty),
    note: toStringOrEmpty(raw.note),
    user: toStringOrEmpty(raw.user),
    atISO: toAtIso(raw)
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
    const docs = await firestoreMovementsRepository.getAll(TENANT_ID);
    const fetched = Array.isArray(docs)
      ? docs.map(toNormalizedMovement).filter(Boolean)
      : [];
    const mergedById = new Map(fetched.map((movement) => [movement.id, movement]));
    cache.forEach((movement) => {
      if (movement?.id && !mergedById.has(movement.id)) {
        mergedById.set(movement.id, movement);
      }
    });
    const merged = Array.from(mergedById.values());
    setCache(merged);
    fetched.forEach((movement) => {
      if (movement?.id) knownIds.add(movement.id);
    });
    hasLoaded = true;
  } catch (error) {
    console.error("[FirestoreMovementsAdapter] Failed to load Firestore movements", error);
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
  const normalized = movements.map(toNormalizedMovement).filter(Boolean);
  setCache(normalized);

  normalized.forEach((movement) => {
    const id = movement?.id;
    if (!id || knownIds.has(id)) return;
    const payload = toFirestorePayload(movement);
    if (!payload) return;
    void firestoreMovementsRepository
      .create(TENANT_ID, payload)
      .then(() => {
        knownIds.add(id);
        return updateProductStockForMovement(movement);
      })
      .catch((error) => {
        console.error("[FirestoreMovementsAdapter] Failed to save movement", error);
      });
  });
}

export const firestoreMovementsRepositoryAdapter = {
  getAll,
  saveAll
};

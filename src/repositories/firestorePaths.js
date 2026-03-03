import { collection, doc } from "firebase/firestore";
import { db } from "../lib/firebase.js";

// Base tenant doc.
export function tenantDoc(tenantId) {
  return doc(db, "tenants", tenantId);
}

export const productsCollection = (tenantId) =>
  collection(db, "tenants", tenantId, "products");

export function productDoc(tenantId, productId) {
  return doc(productsCollection(tenantId), productId);
}

export function movementsCollection(tenantId) {
  return collection(tenantDoc(tenantId), "movements");
}

export function movementDoc(tenantId, movementId) {
  return doc(movementsCollection(tenantId), movementId);
}

export function salesCollection(tenantId) {
  return collection(tenantDoc(tenantId), "sales");
}

export function saleDoc(tenantId, saleId) {
  return doc(salesCollection(tenantId), saleId);
}

export function usersCollection(tenantId) {
  return collection(tenantDoc(tenantId), "users");
}

export function userDoc(tenantId, userId) {
  return doc(usersCollection(tenantId), userId);
}

export function settingsDoc(tenantId) {
  return doc(tenantDoc(tenantId), "settings", "config");
}

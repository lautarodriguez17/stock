import {
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

function stripId(data) {
  if (!data || typeof data !== "object") return {};
  const { id, ...rest } = data;
  return rest;
}

function withTimestamps(data, { includeCreated }) {
  const now = serverTimestamp();
  const payload = { ...data, updatedAt: now };
  if (includeCreated) payload.createdAt = now;
  return payload;
}

export function createFirestoreRepository({
  collectionRef,
  docRef,
  softDelete = false,
  softDeletePatch
}) {
  async function getAll(tenantId) {
    const snapshot = await getDocs(collectionRef(tenantId));
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  }

  async function getById(tenantId, id) {
    const snapshot = await getDoc(docRef(tenantId, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() };
  }

  async function create(tenantId, data) {
    const payload = withTimestamps(stripId(data), { includeCreated: true });
    if (data?.id) {
      const ref = docRef(tenantId, data.id);
      await setDoc(ref, payload, { merge: true });
      return data.id;
    }
    const ref = await addDoc(collectionRef(tenantId), payload);
    return ref.id;
  }

  async function update(tenantId, id, patch) {
    const payload = withTimestamps(stripId(patch), { includeCreated: false });
    await updateDoc(docRef(tenantId, id), payload);
    return id;
  }

  async function remove(tenantId, id, options = {}) {
    const shouldSoftDelete = options.soft ?? softDelete;
    if (shouldSoftDelete) {
      const fallbackPatch = { deletedAt: serverTimestamp(), updatedAt: serverTimestamp() };
      const patch = options.patch || (softDeletePatch ? softDeletePatch() : fallbackPatch);
      await updateDoc(docRef(tenantId, id), patch);
      return;
    }
    await deleteDoc(docRef(tenantId, id));
  }

  return {
    getAll,
    getById,
    create,
    update,
    delete: remove
  };
}

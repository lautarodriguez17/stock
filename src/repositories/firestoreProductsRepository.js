import { getDocs, serverTimestamp } from "firebase/firestore";
import { createFirestoreRepository } from "./firestoreRepositoryFactory.js";
import { productDoc, productsCollection } from "./firestorePaths.js";

// Soft delete defaults to disabling the product to match current local behavior.
const baseRepository = createFirestoreRepository({
  collectionRef: productsCollection,
  docRef: productDoc,
  softDelete: true,
  softDeletePatch: () => ({
    active: false,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
});

export const firestoreProductsRepository = {
  ...baseRepository,
  async getAll(tenantId) {
    const ref = productsCollection(tenantId);

    const snapshot = await getDocs(ref);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  }
};

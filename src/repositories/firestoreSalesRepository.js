import { createFirestoreRepository } from "./firestoreRepositoryFactory.js";
import { saleDoc, salesCollection } from "./firestorePaths.js";

export const firestoreSalesRepository = createFirestoreRepository({
  collectionRef: salesCollection,
  docRef: saleDoc
});

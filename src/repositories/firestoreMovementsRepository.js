import { createFirestoreRepository } from "./firestoreRepositoryFactory.js";
import { movementDoc, movementsCollection } from "./firestorePaths.js";

export const firestoreMovementsRepository = createFirestoreRepository({
  collectionRef: movementsCollection,
  docRef: movementDoc
});

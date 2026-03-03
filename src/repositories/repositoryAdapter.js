import { productRepo } from "../data/productRepo.js";
import { movementRepo } from "../data/movementRepo.js";
import { firestoreProductsRepositoryAdapter } from "./firestoreProductsRepositoryAdapter.js";
import { firestoreMovementsRepositoryAdapter } from "./firestoreMovementsRepositoryAdapter.js";

export const RepositorySource = {
  LOCAL: "local",
  FIRESTORE: "firestore"
};


const repositoryMode = (import.meta.env.VITE_REPOSITORY_MODE || RepositorySource.LOCAL).toLowerCase();


export function getLocalRepositories() {
  if (repositoryMode === RepositorySource.FIRESTORE) {
    return {
      products: firestoreProductsRepositoryAdapter,
      movements: firestoreMovementsRepositoryAdapter
    };
  }

  return {
    products: productRepo,
    movements: movementRepo
  };
}

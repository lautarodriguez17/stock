import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export async function runFirestoreWriteTest() {
  console.log("🔥 Firestore WRITE test: START");

  const ref = collection(db, "tenants", "kiosco", "products");

  const docRef = await addDoc(ref, {
    name: "Producto test",
    sku: "TEST-001",
    category: "Test",
    price: 100,
    cost: 70,
    stock: 5,
    createdAt: serverTimestamp(),
  });

  console.log("✅ Documento creado con ID:", docRef.id);
}

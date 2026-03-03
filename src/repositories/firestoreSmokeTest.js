import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

export async function runFirestoreSmokeTest() {
  console.log("🔥 Firestore smoke test: START");

  const tenantId = "kiosco"; // 🔒 HARDCODEADO
  const colRef = collection(db, "tenants", tenantId, "smoke_test");

  console.log("📍 Collection path:", colRef.path);

  const snap1 = await getDocs(colRef);
  console.log("📦 Initial docs:", snap1.size);

  const docRef = await addDoc(colRef, {
    name: "test",
    createdAt: new Date(),
  });

  console.log("✅ Created doc:", docRef.id);

  await deleteDoc(doc(db, colRef.path, docRef.id));
  console.log("🧹 Deleted doc");

  console.log("🎉 Firestore SMOKE TEST OK");
}

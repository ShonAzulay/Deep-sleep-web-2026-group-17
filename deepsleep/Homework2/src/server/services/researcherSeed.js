import { db } from "../firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export async function ensureResearcherSeed() {
  const researcherRef = doc(db, "users", "researchManager_123");

  const snap = await getDoc(researcherRef);
  if (snap.exists()) return;

  await setDoc(researcherRef, {
    role: "researchManager",
    username: "123",
    password: "123",
    createdAt: serverTimestamp(),
  });
}

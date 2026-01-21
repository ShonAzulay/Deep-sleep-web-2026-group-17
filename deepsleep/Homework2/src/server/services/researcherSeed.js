/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer.
 * It abstracts the database operations (Firebase) from the client-side View layer.
 * All direct DB access should happen here.
 */
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

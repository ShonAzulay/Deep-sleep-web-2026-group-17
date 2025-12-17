import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function saveSleepEntry(entry) {
  const ref = await addDoc(collection(db, "sleepEntries"), {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

export async function fetchClassCustomizations() {
  const snap = await getDocs(collection(db, "classCustomizations"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

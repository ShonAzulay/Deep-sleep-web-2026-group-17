
import { db } from "./firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

export async function loginWithDb({ role, username, password }) {
  const usersCol = collection(db, "users");

  const q = query(
    usersCol,
    where("role", "==", role),
    where("username", "==", username),
    where("password", "==", password),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

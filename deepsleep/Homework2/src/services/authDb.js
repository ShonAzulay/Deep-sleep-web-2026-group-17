// src/services/authDb.js
import { db } from "./firebase";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

export async function loginWithDb({ role, username, password }) {
  const usersCol = collection(db, "users");

  // שאילתה שמחפשת משתמש עם התפקיד הנכון, שם המשתמש והסיסמה
  const q = query(
    usersCol,
    where("role", "==", role),
    where("username", "==", username.trim()),
    where("password", "==", password.trim()),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null; // אם לא נמצא תלמיד כזה

  const userDoc = snap.docs[0];
  return { id: userDoc.id, ...userDoc.data() };
}
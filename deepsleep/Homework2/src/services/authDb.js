// src/services/authDb.js
import { db } from "./firebase";
import {
  collectionGroup,
  getDocs,
  limit,
  query,
  where
} from "firebase/firestore";

/**
 * התחברות למערכת באמצעות מסד הנתונים
 * משתמש ב-Collection Group Query כדי למצוא את המשתמש בכל מקום בהיררכיה
 * דורש אינדקס ב-Firestore עבור השדות: role, username, password (או שילוב)
 */
export async function loginWithDb({ role, username, password }) {
  // חיפוש בכל אוסף שנקרא "users" לא משנה איפה הוא ממוקם
  const usersQ = query(
    collectionGroup(db, "users"),
    where("role", "==", role),
    where("username", "==", username.trim()),
    where("password", "==", password.trim()),
    limit(1)
  );

  const snap = await getDocs(usersQ);
  if (snap.empty) return null; // אם לא נמצא משתמש כזה

  const userDoc = snap.docs[0];
  const userData = userDoc.data();

  // הנתונים מכילים גם את experimentId ו-classId שרשמנו ביצירה
  return { id: userDoc.id, ...userData };
}
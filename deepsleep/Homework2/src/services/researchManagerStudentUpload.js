import { db } from "./firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

/**
 * בודק האם שם משתמש כבר תפוס במערכת (עבור תפקיד סטודנט)
 */
async function isStudentUsernameTaken(username) {
  const q = query(
    collection(db, "users"),
    where("role", "==", "student"),
    where("username", "==", username),
    limit(1)
  );

  const snap = await getDocs(q);
  return !snap.empty;
}

/**
 * יצירת תלמיד חדש ב-Database
 * המזהה (ID) נבנה בצורה: Student-className-username
 */
export async function researchManagerCreateStudent({ username, className, password }) {
  const trimmedUsername = username.trim();
  const trimmedClassName = className.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedClassName || !trimmedPassword) {
    throw new Error("חובה למלא: שם משתמש, כיתה, סיסמה");
  }

  const taken = await isStudentUsernameTaken(trimmedUsername);
  if (taken) {
    throw new Error("שם המשתמש כבר קיים");
  }

  // יצירת ה-ID המותאם אישית
  const customId = `Student-${trimmedClassName}-${trimmedUsername}`;
  const studentDocRef = doc(db, "users", customId);

  await setDoc(studentDocRef, {
    role: "student",
    username: trimmedUsername,
    className: trimmedClassName,
    password: trimmedPassword,
    createdAt: serverTimestamp(),
  });

  return customId; 
}

/**
 * מחיקת תלמיד מה-Database
 * מקבל את שם הכיתה ושם המשתמש כדי לבנות את ה-ID המדויק
 */
export async function researchManagerDeleteStudent(className, username) {
  try {
    const trimmedUsername = username.trim();
    const trimmedClassName = className.trim();
    
    // בניית ה-ID המדויק כפי שנשמר ביצירה
    const customId = `Student-${trimmedClassName}-${trimmedUsername}`;
    const studentDocRef = doc(db, "users", customId);

    // ביצוע המחיקה
    await deleteDoc(studentDocRef);
    
    return true;
  } catch (e) {
    console.error("Error deleting student: ", e);
    throw new Error("שגיאה במחיקת התלמיד. וודא שהפרטים נכונים.");
  }
}
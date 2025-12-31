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
  collectionGroup
} from "firebase/firestore";

/**
 * בודק האם שם משתמש כבר תפוס במערכת (עבור תפקיד סטודנט)
 * משתמש ב-Collection Group Query כדי לבדוק בכל ההיררכיה
 */
async function isStudentUsernameTaken(username) {
  const q = query(
    collectionGroup(db, "users"),
    where("role", "==", "student"),
    where("username", "==", username),
    limit(1)
  );

  const snap = await getDocs(q);
  return !snap.empty;
}

/**
 * יצירת תלמיד חדש ב-Database בהיררכיה החדשה
 * experiments/{expId}/classes/{classId}/users/{studentId}
 */
export async function researchManagerCreateStudent({ experimentId, classId, username, className, password }) {
  const trimmedExpId = experimentId?.trim();
  const trimmedClassId = classId?.trim();
  const trimmedUsername = username?.trim();
  const trimmedClassName = className?.trim(); // שם ה-UI של הכיתה, אולי שונה מה-ID
  const trimmedPassword = password?.trim();

  if (!trimmedExpId || !trimmedClassId || !trimmedUsername || !trimmedClassName || !trimmedPassword) {
    throw new Error("חובה למלא: מזהה ניסוי, מזהה כיתה, שם משתמש, שם כיתה, סיסמה");
  }

  const taken = await isStudentUsernameTaken(trimmedUsername);
  if (taken) {
    throw new Error("שם המשתמש כבר קיים במערכת");
  }

  // יצירת ה-ID המותאם אישית
  const customId = `Student-${trimmedClassId}-${trimmedUsername}`;
  
  // בניית הנתיב החדש
  const studentDocRef = doc(db, "experiments", trimmedExpId, "classes", trimmedClassId, "users", customId);

  await setDoc(studentDocRef, {
    role: "student",
    username: trimmedUsername,
    password: trimmedPassword,
    className: trimmedClassName, // שומרים גם את השם לקריאות
    experimentId: trimmedExpId,  // Context for easy login lookup
    classId: trimmedClassId,     // Context for easy login lookup
    createdAt: serverTimestamp(),
  });

  return customId; 
}

/**
 * מחיקת תלמיד מה-Database
 */
export async function researchManagerDeleteStudent(experimentId, classId, username) {
  try {
    const trimmedExpId = experimentId.trim();
    const trimmedClassId = classId.trim();
    const trimmedUsername = username.trim();
    
    // בניית ה-ID המדויק כפי שנשמר ביצירה
    const customId = `Student-${trimmedClassId}-${trimmedUsername}`;
    
    // בניית הנתיב המלא למחיקה
    const studentDocRef = doc(db, "experiments", trimmedExpId, "classes", trimmedClassId, "users", customId);

    // ביצוע המחיקה
    await deleteDoc(studentDocRef);
    
    return true;
  } catch (e) {
    console.error("Error deleting student: ", e);
    throw new Error("שגיאה במחיקת התלמיד. וודא שהפרטים נכונים.");
  }
}
import { db } from "../firebase";
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
/**
 * יצירת תלמיד חדש ב-Database בהיררכיה החדשה
 * experiments/{expId}/classes/{classId}/users/{studentId}
 */
export async function researchManagerCreateStudent({ experimentId, username, password, schoolName, grade, classNum }) {
  const trimmedExpId = experimentId?.trim();
  const trimmedUsername = username?.trim();
  const trimmedPassword = password?.trim();

  const trimmedSchool = schoolName?.trim();
  const trimmedGrade = grade?.trim();
  const trimmedClassNum = classNum?.trim();

  if (!trimmedExpId || !trimmedUsername || !trimmedPassword || !trimmedSchool || !trimmedGrade || !trimmedClassNum) {
    throw new Error("חובה למלא: מזהה ניסוי, שם משתמש, סיסמה, בית ספר, שכבה ומספר כיתה");
  }

  const taken = await isStudentUsernameTaken(trimmedUsername);
  if (taken) {
    throw new Error("שם המשתמש כבר קיים במערכת");
  }

  // Derive Class ID (Same logic as Teacher)
  const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\u0590-\u05FF]/g, '');
  const derivedClassId = `${sanitize(trimmedSchool)}_${sanitize(trimmedGrade)}_${sanitize(trimmedClassNum)}`;

  // יצירת ה-ID המותאם אישית
  const customId = `Student-${derivedClassId}-${trimmedUsername}`;

  // בניית הנתיב החדש
  const studentDocRef = doc(db, "experiments", trimmedExpId, "classes", derivedClassId, "users", customId);

  await setDoc(studentDocRef, {
    role: "student",
    username: trimmedUsername,
    password: trimmedPassword,
    className: `${trimmedGrade}${trimmedClassNum}`, // תצוגה כללית

    // Hierarchy context
    schoolName: trimmedSchool,
    grade: trimmedGrade,
    classNum: trimmedClassNum,

    experimentId: trimmedExpId,
    classId: derivedClassId,
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
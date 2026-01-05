import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * שמירת רשומת שינה בנתיב ההיררכי
 * experiments/{expId}/classes/{classId}/responses/{studentId_Date}
 * 
 * @param {string} experimentId
 * @param {string} classId
 * @param {string} studentId
 * @param {Object} entry - אובייקט עם נתוני השינה. חייב להכיל שדה date או שנשתמש בתאריך הנוכחי.
 */
export async function saveSleepEntry(experimentId, classId, studentId, entry) {
  if (!experimentId || !classId || !studentId) {
    throw new Error("Missing required context IDs (experimentId, classId, studentId)");
  }

  // נניח ש-entry.date הוא מחרוזת תאריך (YYYY-MM-DD). אם אין, ניקח מהיום.
  // כדאי לוודא שהפורמט עקבי כדי למנוע כפילויות.
  const dateStr = entry.date || new Date().toISOString().split('T')[0];

  // יצירת מזהה ייחודי לרשומה למניעת כפילויות באותו יום
  // יצירת מזהה ייחודי לרשומה למניעת כפילויות באותו יום
  const docId = `${studentId}_${dateStr}`;

  const responseDocRef = doc(db, "experiments", experimentId, "classes", classId, "responses", docId);

  await setDoc(responseDocRef, {
    ...entry,
    studentId,
    experimentId,
    classId,
    date: dateStr, // מוודאים שהתאריך נשמר
    updatedAt: serverTimestamp()
  });

  return docId;
}

/**
 * החזרת מספר הרשומות שהמשתמש מילא (עבור פרוגרס בר ושחרור שלבים)
 */
import { collection, query, where, getCountFromServer } from "firebase/firestore";

export async function getUserSubmissionCount(experimentId, classId, studentId) {
  try {
    const collRef = collection(db, "experiments", experimentId, "classes", classId, "responses");
    const q = query(collRef, where("studentId", "==", studentId));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (err) {
    console.error("Error counting submissions:", err);
    return 0;
  }
}

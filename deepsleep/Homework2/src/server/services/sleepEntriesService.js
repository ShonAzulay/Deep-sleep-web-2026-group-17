/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer.
 * It abstracts the database operations (Firebase) from the client-side View layer.
 * All direct DB access should happen here.
 */
import { db } from "../firebase";
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
import { collection, query, where, getCountFromServer, getDocs, collectionGroup } from "firebase/firestore";

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

/**
 * החזרת מועד ההגשה האחרון (timestamp) של תלמיד
 * לצורך חישוב מתי הוא יכול להגיש שוב (למשל: ביום למחרת ב-7 בבוקר)
 */
import { limit, orderBy } from "firebase/firestore";

export async function getLastSubmissionTime(experimentId, classId, studentId) {
  try {
    const collRef = collection(db, "experiments", experimentId, "classes", classId, "responses");
    // Filter by student only, NO orderBy to avoid index requirement
    const q = query(collRef, where("studentId", "==", studentId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    // Client-side sort: Find the latest 'updatedAt'
    const docs = snapshot.docs.map(d => d.data());

    // Sort descending by date/time
    docs.sort((a, b) => {
      const timeA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
      const timeB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
      return timeB - timeA;
    });

    const latest = docs[0];
    return latest.updatedAt ? latest.updatedAt.toDate() : null;
  } catch (err) {
    console.error("Error fetching last submission time:", err);
    return null;
  }
}

/**
 * שליפת כל רשומות השינה מכל הכיתות לטובת דוחות
 */
export async function fetchAllSleepEntries() {
  try {
    const q = query(collectionGroup(db, "responses"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  } catch (err) {
    console.error("Error fetching all sleep entries:", err);
    return [];
  }
}

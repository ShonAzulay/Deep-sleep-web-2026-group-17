import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  writeBatch,
  doc,
  serverTimestamp
} from "firebase/firestore";

// Helper to get collection refs
const getRequestsCol = (expId, classId) => collection(db, "experiments", expId, "classes", classId, "questionRequests");
const getActiveQuestionsCol = (expId, classId) => collection(db, "experiments", expId, "classes", classId, "activeQuestions");

/**
 * מגיש בקשה להוספת שאלה (למשל ע"י מורה)
 */
export async function submitQuestionRequest(experimentId, classId, questionText) {
  if (!questionText.trim()) throw new Error("Question text cannot be empty");

  await addDoc(getRequestsCol(experimentId, classId), {
    text: questionText,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

/**
 * שולף את כל השאלות הממתינות לאישור עבור כיתה מסוימת
 */
export async function fetchPendingQuestions(experimentId, classId) {
  const q = query(
    getRequestsCol(experimentId, classId),
    where("status", "==", "pending")
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * אישור רשימת שאלות (כולל עריכה)
 * @param {string} experimentId 
 * @param {string} classId 
 * @param {Array<{originalId: string, finalText: string}>} approvedQuestionsList 
 */
export async function approveQuestions(experimentId, classId, approvedQuestionsList) {
  const batch = writeBatch(db);

  for (const item of approvedQuestionsList) {
    const { originalId, finalText } = item;

    // 1. יצירת השאלה ב-activeQuestions
    // משתמשים ב-doc() בלי ID כדי לקבל ID אוטומטי חדש
    const newQuestionRef = doc(getActiveQuestionsCol(experimentId, classId));

    batch.set(newQuestionRef, {
      text: finalText,
      createdAt: serverTimestamp(),
      originRequestId: originalId,
      isVisible: true // ברירת מחדל
    });

    // 2. עדכון הסטטוס של הבקשה המקורית ל-approved
    // או אפשר למחוק: batch.delete(requestRef);
    // נבחר לעדכן סטטוס כדי לשמור היסטוריה
    const requestRef = doc(db, "experiments", experimentId, "classes", classId, "questionRequests", originalId);
    batch.update(requestRef, {
      status: "approved",
      approvedAt: serverTimestamp(),
      finalQuestionId: newQuestionRef.id
    });
  }

  await batch.commit();
}

/**
 * שליפת שאלות פעילות (לשימוש התלמידים/דשבורד)
 */
export async function fetchActiveQuestions(experimentId, classId) {
  const snap = await getDocs(getActiveQuestionsCol(experimentId, classId));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

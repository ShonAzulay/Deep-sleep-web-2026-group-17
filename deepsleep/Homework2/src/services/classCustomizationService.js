import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  writeBatch,
  doc,
  serverTimestamp,
  collectionGroup
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
/**
 * שולף את כל השאלות הממתינות מכל הכיתות ומכל הניסויים
 * משתמש ב-Collection Group Query
 */
export async function fetchPendingQuestions() {
  const q = query(
    collectionGroup(db, "questionRequests"),
    where("status", "==", "pending")
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => {
    // היררכיה: experiments/{expId}/classes/{classId}/questionRequests/{docId}
    const classRef = d.ref.parent.parent;
    const expRef = classRef.parent.parent;

    return {
      id: d.id,
      ...d.data(),
      // שליפת הקשר (Context) מהנתיב כדי שנדע מאיפה זה הגיע
      classId: classRef.id,
      experimentId: expRef.id,
      path: d.ref.path // שומרים את הנתיב המלא לשימוש בעדכון
    };
  });
}

/**
 * אישור רשימת שאלות (כולל עריכה וסיווג)
 * מקבל את המידע המלא (כולל classId ו-experimentId) מתוך האובייקט של השאלה עצמה
 */
export async function approveQuestions(approvedQuestionsList) {
  const batch = writeBatch(db);

  for (const item of approvedQuestionsList) {
    const { originalId, finalText, category, classId, experimentId, type, options } = item;

    // וודא שיש לנו את כל המידע הדרוש
    if (!classId || !experimentId) {
      console.warn("Missing context for question approval", item);
      continue;
    }

    // 1. יצירת השאלה ב-activeQuestions של הכיתה הספציפית
    const newQuestionRef = doc(collection(db, "experiments", experimentId, "classes", classId, "activeQuestions"));

    batch.set(newQuestionRef, {
      text: finalText,
      category: category || "general",
      type: type || "text", // 'text' | 'select' | 'multi'
      options: options || [], // Array of strings if select/multi
      createdAt: serverTimestamp(),
      originRequestId: originalId,
      isVisible: true
    });

    // 2. עדכון הסטטוס של הבקשה המקורית
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

/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer.
 * It abstracts the database operations (Firebase) from the client-side View layer.
 * All direct DB access should happen here.
 */
import { db } from "../firebase";
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
 * Submits a request to add a question (e.g. by a teacher)
 */
export async function submitQuestionRequest(experimentId, classId, questionData) {
  const { text, type = "text", options = [] } = questionData;
  if (!text || !text.trim()) throw new Error("טקסט השאלה לא יכול להיות ריק");

  await addDoc(getRequestsCol(experimentId, classId), {
    text: text,
    type: type, // 'text' | 'select' | 'multi'
    options: options,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetches all pending questions for a specific class
 */
/**
 * Fetches all pending questions from all classes and experiments
 * Uses Collection Group Query
 */
export async function fetchPendingQuestions() {
  const q = query(
    collectionGroup(db, "questionRequests"),
    where("status", "==", "pending")
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => {
    // Hierarchy: experiments/{expId}/classes/{classId}/questionRequests/{docId}
    const classRef = d.ref.parent.parent;
    const expRef = classRef.parent.parent;

    return {
      id: d.id,
      ...d.data(),
      // Extract context from path to know the source
      classId: classRef.id,
      experimentId: expRef.id,
      path: d.ref.path // Save full path for update usage
    };
  });
}

/**
 * Approve list of questions (including edit and categorize)
 * Receives full info (including classId and experimentId) from the question object itself
 */
export async function approveQuestions(approvedQuestionsList) {
  const batch = writeBatch(db);

  for (const item of approvedQuestionsList) {
    const { originalId, finalText, category, classId, experimentId, type, options } = item;

    // Ensure we have all required info
    if (!classId || !experimentId) {
      console.warn("Missing context for question approval", item);
      continue;
    }

    // 1. Create question in activeQuestions of the specific class
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

    // 2. Update status of the original request
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
 * Fetch active questions (for students/dashboard usage)
 */
export async function fetchActiveQuestions(experimentId, classId) {
  const snap = await getDocs(getActiveQuestionsCol(experimentId, classId));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch all active questions from all classes for reports
 */
export async function fetchAllGlobalActiveQuestions() {
  const q = query(collectionGroup(db, "activeQuestions"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

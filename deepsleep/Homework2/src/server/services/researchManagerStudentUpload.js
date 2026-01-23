/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer.
 * It abstracts the database operations (Firebase) from the client-side View layer.
 * All direct DB access should happen here.
 */
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
 * Checks if a username is already taken in the system (for student role)
 * Uses Collection Group Query to check in the entire hierarchy
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
 * Create a new student in Database in the new hierarchy
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

  // Create custom ID
  const customId = `Student-${derivedClassId}-${trimmedUsername}`;

  // Build the new path
  const studentDocRef = doc(db, "experiments", trimmedExpId, "classes", derivedClassId, "users", customId);

  await setDoc(studentDocRef, {
    role: "student",
    username: trimmedUsername,
    password: trimmedPassword,
    className: `${trimmedGrade}${trimmedClassNum}`, // General display

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
 * Delete student from Database
 */
export async function researchManagerDeleteStudent(experimentId, classId, username) {
  try {
    const trimmedExpId = experimentId.trim();
    const trimmedClassId = classId.trim();
    const trimmedUsername = username.trim();

    // Build exact ID as saved during creation
    const customId = `Student-${trimmedClassId}-${trimmedUsername}`;

    // Build full path for deletion
    const studentDocRef = doc(db, "experiments", trimmedExpId, "classes", trimmedClassId, "users", customId);

    // Perform deletion
    await deleteDoc(studentDocRef);

    return true;
  } catch (e) {
    console.error("Error deleting student: ", e);
    throw new Error("שגיאה במחיקת התלמיד. וודא שהפרטים נכונים.");
  }
}
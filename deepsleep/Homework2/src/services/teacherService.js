import { db } from "./firebase";
import { collection, getDocs, getCountFromServer } from "firebase/firestore";

/**
 * שליפת נתוני שינה עבור כיתה ספציפית
 * data path: experiments/{expId}/classes/{classId}/responses
 */
export async function teacherGetClassData(experimentId, classId) {
  if (!experimentId || !classId) {
    throw new Error("Must provide experimentId and classId");
  }

  try {
    const colRef = collection(db, "experiments", experimentId, "classes", classId, "responses");
    const querySnapshot = await getDocs(colRef);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // Returns full data including studentId for export purposes
      return { id: doc.id, ...data };
    });
  } catch (e) {
    console.error(e);
    throw new Error("שגיאה במשיכת נתונים");
  }
}

/**
 * Returns the total number of submissions for the class
 */
export async function teacherGetSubmissionCount(experimentId, classId) {
  if (!experimentId || !classId) return 0;

  try {
    const colRef = collection(db, "experiments", experimentId, "classes", classId, "responses");
    const snapshot = await getCountFromServer(colRef);
    return snapshot.data().count;
  } catch (e) {
    console.error("Error counting class submissions:", e);
    return 0;
  }
}

// Imports for registration
import { doc, setDoc, serverTimestamp, collectionGroup, query, where, limit } from "firebase/firestore";

/**
 * Checks if a teacher username (email) is already taken.
 */
async function isTeacherUsernameTaken(username) {
  const q = query(
    collectionGroup(db, "users"),
    where("role", "==", "teacher"),
    where("username", "==", username),
    limit(1)
  );

  const snap = await getDocs(q);
  return !snap.empty;
}

/**
 * Registers a new Teacher (Self-Service).
 * Creates the Teacher user AND the Class document if needed.
 */
export async function registerTeacher({
  experimentId,
  teacherName,
  email,
  password,
  schoolName,
  grade,
  classNum
}) {
  const trimmedExpId = experimentId?.trim();
  const trimmedName = teacherName?.trim();
  const trimmedEmail = email?.trim();
  const trimmedPassword = password?.trim();
  const trimmedSchool = schoolName?.trim();
  const trimmedGrade = grade?.trim();
  const trimmedClassNum = classNum?.trim();

  if (!trimmedExpId || !trimmedName || !trimmedEmail || !trimmedPassword || !trimmedSchool || !trimmedGrade || !trimmedClassNum) {
    throw new Error("חובה למלא את כל השדות: מזהה ניסוי, שם, אימייל, סיסמה, בית ספר, שכבה ומספר כיתה");
  }

  // Use email as username for login uniqueness
  const taken = await isTeacherUsernameTaken(trimmedEmail);
  if (taken) {
    throw new Error("כתובת האימייל (שם המשתמש) כבר קיימת במערכת עבור מורה");
  }

  // Derive Class ID
  const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\u0590-\u05FF]/g, '');

  const safeSchool = sanitize(trimmedSchool);
  const safeGrade = sanitize(trimmedGrade);
  const safeClassNum = sanitize(trimmedClassNum);

  const derivedClassId = `${safeSchool}_${safeGrade}_${safeClassNum}`;

  // 1. Ensure ROOT Experiment Document Exists (for Manager List)
  const expDocRef = doc(db, "experiments", trimmedExpId);
  await setDoc(expDocRef, {
    id: trimmedExpId,
    lastUpdated: serverTimestamp()
  }, { merge: true });

  // Ensure Class Document Exists (So it appears in Manager List)
  const classDocRef = doc(db, "experiments", trimmedExpId, "classes", derivedClassId);
  // We use setDoc with merge:true so we don't overwrite if exists, but ensure it exists
  await setDoc(classDocRef, {
    schoolName: trimmedSchool,
    grade: trimmedGrade,
    classNum: trimmedClassNum,
    experimentId: trimmedExpId,
    createdAt: serverTimestamp() // Note: this might update timestamp if exists, which is minor
  }, { merge: true });

  // Custom Teacher ID
  const customId = `Teacher-${derivedClassId}-${sanitize(trimmedName)}`;

  // Construct path: experiments/{expId}/classes/{derivedClassId}/users/{customId}
  const teacherDocRef = doc(db, "experiments", trimmedExpId, "classes", derivedClassId, "users", customId);

  const newTeacherData = {
    role: "teacher",
    fullName: trimmedName,
    username: trimmedEmail, // Used for login
    email: trimmedEmail,
    password: trimmedPassword,

    // Context Hierarchy
    schoolName: trimmedSchool,
    grade: trimmedGrade,
    classNum: trimmedClassNum,

    // System binding
    experimentId: trimmedExpId,
    classId: derivedClassId,

    createdAt: serverTimestamp(),
  };

  await setDoc(teacherDocRef, newTeacherData);

  // Return user object for immediate login
  return { id: customId, ...newTeacherData };
}
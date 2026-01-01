import { db } from "./firebase";
import {
  doc,
  setDoc,
  collectionGroup,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where
} from "firebase/firestore";

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
 * Creates a new Teacher user in the database.
 * The classId is strictly derived from the School -> Grade -> Class hierarchy.
 */
export async function researchManagerCreateTeacher({
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
  // Sanitizing to ensure valid path segments (removing spaces/special chars if needed, or keeping simple)
  // Simple sanitization: replace spaces with hyphens, remove special chars
  const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\u0590-\u05FF]/g, '');
  
  const safeSchool = sanitize(trimmedSchool);
  const safeGrade = sanitize(trimmedGrade);
  const safeClassNum = sanitize(trimmedClassNum);
  
  const derivedClassId = `${safeSchool}_${safeGrade}_${safeClassNum}`;

  // Custom Teacher ID
  const customId = `Teacher-${derivedClassId}-${sanitize(trimmedName)}`;

  // Construct path: experiments/{expId}/classes/{derivedClassId}/users/{customId}
  const teacherDocRef = doc(db, "experiments", trimmedExpId, "classes", derivedClassId, "users", customId);

  await setDoc(teacherDocRef, {
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
  });

  return { id: customId, classId: derivedClassId };
}

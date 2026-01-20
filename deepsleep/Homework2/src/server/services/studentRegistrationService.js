import { db } from "../firebase";
import {
    doc,
    setDoc,
    getDocs,
    limit,
    query,
    serverTimestamp,
    where,
    collectionGroup
} from "firebase/firestore";

/**
 * Checks if a username is already taken by another student.
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
 * Registers a new student.
 * Path: experiments/{expId}/classes/{classId}/users/{studentId}
 */
export async function registerStudent({ experimentId, username, password, schoolName, grade, classNum }) {
    const trimmedExpId = experimentId?.trim();
    const trimmedUsername = username?.trim();
    const trimmedPassword = password?.trim();
    const trimmedSchool = schoolName?.trim();
    const trimmedGrade = grade?.trim();
    const trimmedClassNum = classNum?.trim();

    if (!trimmedExpId || !trimmedUsername || !trimmedPassword || !trimmedSchool || !trimmedGrade || !trimmedClassNum) {
        throw new Error("חובה למלא את כל השדות");
    }

    const taken = await isStudentUsernameTaken(trimmedUsername);
    if (taken) {
        throw new Error("שם המשתמש כבר תפוס, אנא בחר שם אחר.");
    }

    // Generate Class ID
    const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\u0590-\u05FF]/g, '');
    const derivedClassId = `${sanitize(trimmedSchool)}_${sanitize(trimmedGrade)}_${sanitize(trimmedClassNum)}`;

    // Generate Custom Student ID
    const customId = `Student-${derivedClassId}-${trimmedUsername}`;

    // Database Reference
    const studentDocRef = doc(db, "experiments", trimmedExpId, "classes", derivedClassId, "users", customId);

    const userData = {
        role: "student",
        username: trimmedUsername,
        password: trimmedPassword, // Note: In a real app, hash this!
        fullName: trimmedUsername, // Using username as name for now

        // Hierarchy context
        schoolName: trimmedSchool,
        grade: trimmedGrade,
        classNum: trimmedClassNum,
        className: `${trimmedGrade}${trimmedClassNum}`,

        experimentId: trimmedExpId,
        classId: derivedClassId,
        createdAt: serverTimestamp(),
    };

    await setDoc(studentDocRef, userData);

    // Return the user object so we can auto-login the user
    return { ...userData, id: customId };
}

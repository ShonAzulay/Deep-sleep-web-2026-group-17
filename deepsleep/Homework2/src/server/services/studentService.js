import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Handles the "Anonymous" login for a student using a specific code (e.g., last 4 digits).
 * This function is used when entering via a Class Link.
 * 
 * Logic:
 * 1. Check if a student with this 'code' exists in this specific class.
 * 2. If YES: Login them in (restore session).
 * 3. If NO: Create a new record for them and log them in.
 * 
 * @param {string} experimentId - The experiment ID from URL
 * @param {string} classId - The class ID from URL
 * @param {string} localCode - The 4-digit code entered by the student
 */
export async function getOrCreateAnonymousStudent(experimentId, classId, localCode) {
    if (!localCode || localCode.length < 3) {
        throw new Error("קוד זיהוי חייב להכיל לפחות 3 תווים");
    }

    // Consistent ID generation: use the code directly as the ID
    const studentId = localCode.trim();
    const studentRef = doc(db, "experiments", experimentId, "classes", classId, "users", studentId);

    const studentSnap = await getDoc(studentRef);

    if (studentSnap.exists()) {
        // --- EXISTING STUDENT ---
        // Return existing data
        const data = studentSnap.data();
        return {
            id: studentId,
            experimentId,
            classId,
            role: "student",
            username: studentId, // For compatibility
            ...data
        };
    } else {
        // --- NEW STUDENT ---
        // Create new record
        const newStudentData = {
            role: "student",
            username: studentId, // We keep this field for compatibility with existing code
            code: studentId,
            createdAt: serverTimestamp(),
            isAnonymous: true
        };

        await setDoc(studentRef, newStudentData);

        return {
            id: studentId,
            experimentId,
            classId,
            role: "student",
            ...newStudentData
        };
    }
}

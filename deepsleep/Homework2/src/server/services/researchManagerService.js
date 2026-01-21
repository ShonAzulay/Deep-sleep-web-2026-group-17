/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer.
 * It abstracts the database operations (Firebase) from the client-side View layer.
 * All direct DB access should happen here.
 */
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Logical Backend for Research Manager Operations
 * Handles Experiments, Classes, and other high-level management tasks.
 */

/**
 * Fetch all classes for a specific experiment
 * @param {string} experimentId
 * @returns {Promise<Array>} List of classes
 */
export async function fetchResearchClasses(experimentId) {
    if (!experimentId) throw new Error("Experiment ID is required");
    const colRef = collection(db, "experiments", experimentId, "classes");
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Create a new class within an experiment
 * @param {string} experimentId
 * @param {string} classId - Constructed ID (School_Grade_Num)
 * @param {Object} classData - { schoolName, grade, classNum }
 */
export async function createResearchClass(experimentId, classId, classData) {
    if (!experimentId || !classId) throw new Error("Missing ID");

    // 1. Ensure ROOT Experiment Document Exists
    await setDoc(doc(db, "experiments", experimentId), {
        lastUpdated: serverTimestamp(),
        id: experimentId
    }, { merge: true });

    // 2. Create Class Document
    await setDoc(doc(db, "experiments", experimentId, "classes", classId), {
        ...classData,
        createdAt: serverTimestamp(),
        experimentId: experimentId
    });
}

/**
 * Fetch all available experiments
 * @returns {Promise<Array>} List of experiments
 */
export async function fetchAllExperiments() {
    const colRef = collection(db, "experiments");
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

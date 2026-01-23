import express from "express";
import { db, admin } from "../config/firebase.js";
const router = express.Router();

router.post("/entry", async (req, res) => {
    try {
        const { experimentId, classId, studentId, entry } = req.body;

        if (!experimentId || !classId || !studentId || !entry) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const dateStr = entry.date || new Date().toISOString().split('T')[0];
        const docId = `${studentId}_${dateStr}`;

        const path = `experiments/${experimentId}/classes/${classId}/responses/${docId}`;
        await db.doc(path).set({
            ...entry,
            studentId,
            experimentId,
            classId,
            date: dateStr,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ success: true, docId });

    } catch (error) {
        console.error("Sleep entry error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;

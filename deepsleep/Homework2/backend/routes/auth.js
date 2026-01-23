import express from "express";
import { db } from "../config/firebase.js";
const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { role, username, password } = req.body;

        if (!role || !username || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Search across all "users" collections
        const snapshot = await db.collectionGroup("users")
            .where("role", "==", role)
            .where("username", "==", username.trim())
            .where("password", "==", password.trim())
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const doc = snapshot.docs[0];
        const userData = doc.data();

        // Remove sensitive data if necessary (e.g. password) before sending back
        // delete userData.password; 

        res.status(200).json({
            id: doc.id,
            ...userData
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;

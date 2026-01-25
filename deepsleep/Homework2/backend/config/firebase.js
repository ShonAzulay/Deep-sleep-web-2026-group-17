import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// Check for environment variable first (Production)
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : require("./serviceAccountKey.json"); // Fallback to file (Local Development)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export const db = admin.firestore();
export const auth = admin.auth();
export { admin };

console.log("Firebase Admin Initialized");

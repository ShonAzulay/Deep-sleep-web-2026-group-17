import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBNP_2N8_FNYgdGnae0VNuTVD7dyTF-b2A",
  authDomain: "web2026group17.firebaseapp.com",
  projectId: "web2026group17",
  storageBucket: "web2026group17.firebasestorage.app",
  messagingSenderId: "173453121860",
  appId: "1:173453121860:web:740e8dfb0bb68a6212df11",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("Firebase projectId:", firebaseConfig.projectId);

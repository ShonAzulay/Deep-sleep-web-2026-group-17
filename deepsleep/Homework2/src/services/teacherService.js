import { db } from "./firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * שליפת נתוני שינה- כולל הסרת הID לצורך אנונימיות
 */
export async function teacherGetClassData() {
  try {
    const querySnapshot = await getDocs(collection(db, "sleepEntries"));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // התממה: מסירים כל מזהה אישי אם קיים
      const { userId, studentName, userEmail, ...anonymizedData } = data; 
      return anonymizedData;
    });
  } catch (e) {
    throw new Error("שגיאה במשיכת נתונים");
  }
}

/**
 * שמירת שאלות ייחודיות לכיתה (עד 5 שאלות)
 */
export async function teacherSaveCustomQuestions(teacherId, className, questions) {
  const filtered = questions.filter(q => q.trim() !== ""); // סינון שדות ריקים
  
  if (filtered.length === 0) {
    throw new Error("חובה להזין לפחות שאלה אחת");
  }

  try {
    return await addDoc(collection(db, "classCustomizations"), {
      teacherId,
      className,
      questions: filtered, // עד 5 שאלות
      status: "pending", // ממתין לאישור מנהלת פרויקט
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error("Error saving questions:", e);
    throw new Error("שגיאה בשמירת השאלות בבסיס הנתונים");
  }
}
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

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
      // התממה: מסירים זיהוי אישי
      // בגלל השינוי במבנה, הזהות היא ב-ID או בשדות המפורשים
      const { studentId, userEmail, ...anonymizedData } = data;
      return anonymizedData;
    });
  } catch (e) {
    console.error(e);
    throw new Error("שגיאה במשיכת נתונים");
  }
}
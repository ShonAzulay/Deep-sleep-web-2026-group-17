import { useState } from "react";
import ResearchStatsView from "./ResearchStatsView";

import { 
  researchManagerCreateStudent, 
  researchManagerDeleteStudent // הוספנו את הייבוא של פונקציית המחיקה
} from "../services/researchManagerStudentUpload";


export default function ResearchManagerDashboard({ onLogout }) {
  const [view, setView] = useState("menu"); // "menu" | "createStudent" | "deleteStudent| stats"
  

  const [studentUsername, setStudentUsername] = useState("");
  const [studentClassName, setStudentClassName] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const canSubmitCreate =
    studentUsername.trim() !== "" &&
    studentClassName.trim() !== "" &&
    studentPassword.trim() !== "" &&
    !loading;

  const canSubmitDelete =
    studentUsername.trim() !== "" &&
    studentClassName.trim() !== "" &&
    !loading;

  // פונקציה ליצירת תלמיד
  async function handleCreateStudent() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const newId = await researchManagerCreateStudent({
        username: studentUsername,
        className: studentClassName,
        password: studentPassword,
      });

      setMessage(`תלמיד נוצר בהצלחה (id: ${newId})`);
      setStudentUsername("");
      setStudentClassName("");
      setStudentPassword("");
    } catch (e) {
      setError(e?.message || "שגיאה ביצירת תלמיד");
    } finally {
      setLoading(false);
    }
  }

  // פונקציה למחיקת תלמיד
  async function handleDeleteStudent() {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את ${studentUsername}?`)) return;

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await researchManagerDeleteStudent(studentClassName, studentUsername);
      setMessage(`התלמיד ${studentUsername} נמחק בהצלחה`);
      setStudentUsername("");
      setStudentClassName("");
    } catch (e) {
      setError(e?.message || "שגיאה במחיקת תלמיד");
    } finally {
      setLoading(false);
    }
  }
  if (view === "stats") {
  return <ResearchStatsView onBack={() => setView("menu")} />;
  }

  // ---------------- מסך הכנסת תלמיד / מחיקת תלמיד ----------------
  if (view === "createStudent" || view === "deleteStudent") {
    const isDelete = view === "deleteStudent";
    
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center
                   bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
                   px-4"
      >
        <div
          className="w-full max-w-md rounded-3xl bg-white/95
                     p-6 sm:p-8 shadow-2xl backdrop-blur"
        >
          <h1 className={`mb-2 text-center text-2xl font-bold ${isDelete ? 'text-rose-600' : 'text-slate-900'}`}>
            {isDelete ? "מחיקת תלמיד" : "הכנסת תלמיד"}
          </h1>

          <p className="mb-6 text-center text-sm text-slate-500">
            {isDelete 
              ? "הזן שם משתמש וכיתה כדי למחוק את התלמיד מהמערכת." 
              : "הזן שם משתמש, כיתה וסיסמה — ונשמור תלמיד במערכת."}
          </p>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="שם משתמש"
              value={studentUsername}
              onChange={(e) => setStudentUsername(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />

            <input
              type="text"
              placeholder="כיתה"
              value={studentClassName}
              onChange={(e) => setStudentClassName(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />

            {!isDelete && (
              <input
                type="password"
                placeholder="סיסמה"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
                className="w-full rounded-xl border px-4 py-3"
              />
            )}

            <button
              disabled={isDelete ? !canSubmitDelete : !canSubmitCreate}
              onClick={isDelete ? handleDeleteStudent : handleCreateStudent}
              className={`w-full rounded-2xl py-3 font-semibold text-white disabled:opacity-40 ${isDelete ? 'bg-rose-600' : 'bg-emerald-600'}`}
            >
              {loading ? "מבצע..." : (isDelete ? "מחק תלמיד" : "צור תלמיד")}
            </button>

            {error && (
              <p className="text-center text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            {message && (
              <p className={`text-center text-sm font-medium ${isDelete ? 'text-rose-700' : 'text-emerald-700'}`}>
                {message}
              </p>
            )}

            <button
              onClick={() => {
                setView("menu");
                setError("");
                setMessage("");
                setStudentUsername("");
                setStudentClassName("");
                setStudentPassword("");
              }}
              className="w-full rounded-2xl border py-3 font-semibold text-slate-800"
            >
              חזרה לתפריט
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- תפריט ראשי ----------------
  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center
                 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
                 px-4"
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white/95
                   p-6 sm:p-10 shadow-2xl backdrop-blur"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              דשבורד מנהל מחקר
            </h1>
          </div>

          <button
            onClick={onLogout}
            className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white"
          >
            התנתק
          </button>
        </div>

        <div className="mt-10 space-y-5">
         <button
            type="button"
            onClick={() => setView("stats")}
            className="w-full rounded-2xl bg-indigo-600 py-6 text-xl font-bold text-white hover:opacity-95"
          >
            צפייה בסטטיסטיקה
          </button>


          <button
            type="button"
            onClick={() => setView("createStudent")}
            className="w-full rounded-2xl bg-emerald-600 py-6
                       text-xl font-bold text-white hover:opacity-95"
          >
            הכנסת תלמיד
          </button>

          <button
            type="button"
            onClick={() => setView("deleteStudent")}
            className="w-full rounded-2xl bg-rose-600 py-6
                       text-xl font-bold text-white hover:opacity-95"
          >
            מחיקת תלמיד
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { teacherGetClassData } from "../services/teacherService";
import { submitQuestionRequest } from "../services/classCustomizationService";

export default function TeacherDashboard({ onLogout }) {
  const [view, setView] = useState("menu"); // "menu" | "addQuestions" | "viewData"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [sleepData, setSleepData] = useState([]);
  const [questionText, setQuestionText] = useState("");

  // Context from Session
  const [context, setContext] = useState(null);

  useEffect(() => {
    try {
      const userStr = sessionStorage.getItem("currentUser");
      if (userStr) {
        setContext(JSON.parse(userStr));
      }
    } catch (e) {
      console.error("Error parsing user context", e);
    }
  }, []);

  // פונקציה לצפייה בנתונים
  async function handleFetchData() {
    if (!context?.experimentId || !context?.classId) {
      alert("חסר מידע על הניסוי/כיתה. אנא התחבר מחדש.");
      return;
    }

    setLoading(true);
    try {
      const data = await teacherGetClassData(context.experimentId, context.classId);
      setSleepData(data);
      setView("viewData");
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  // פונקציה לשמירת שאלות
  async function handleSaveQuestion() {
    if (!context?.experimentId || !context?.classId) {
      alert("חסר מידע על הניסוי/כיתה. אנא התחבר מחדש.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await submitQuestionRequest(context.experimentId, context.classId, questionText);
      setMessage("השאלה נשלחה בהצלחה וממתינה לאישור.");
      setQuestionText("");
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(sleepData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ClassData");
    XLSX.writeFile(wb, "Class_Sleep_Report.xlsx"); // ייצוא לאקסל
  };

  // ---------------- תצוגת הוספת שאלות כיתתיות ----------------
  if (view === "addQuestions") {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">הצעת שאלה חדשה</h1>

          <p className="text-center text-slate-600 mb-6 text-sm">
            הכנס את השאלה שברצונך להוסיף. השאלה תועבר לאישור מנהל המחקר.
          </p>

          <div className="space-y-3">
            <textarea
              placeholder="כתוב כאן את השאלה..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
            />

            <button
              onClick={handleSaveQuestion}
              disabled={loading || !questionText.trim()}
              className="w-full rounded-2xl bg-indigo-600 py-3 font-bold text-white disabled:opacity-50 mt-4 transition-all hover:opacity-90"
            >
              {loading ? "שולח..." : "שלח שאלה לאישור"}
            </button>

            {message && (
              <p className="text-center text-emerald-700 text-sm font-medium mt-2">
                {message}
              </p>
            )}

            <button
              onClick={() => { setView("menu"); setMessage(""); }}
              className="w-full rounded-2xl border border-slate-300 py-3 font-semibold text-slate-800 transition-all hover:bg-slate-50"
            >
              חזרה לתפריט
            </button>
          </div>
        </div>
      </div>
    );
  }
  // ---------------- תצוגת טבלת נתונים ----------------
  if (view === "viewData") {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="w-full max-w-4xl rounded-3xl bg-white/95 p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">נתונים כיתתיים (אנונימי)</h1>
            <button onClick={handleExport} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold">ייצוא לאקסל</button>
          </div>
          <div className="max-h-96 overflow-auto border rounded-xl mb-6">
            <table className="w-full text-right border-collapse">
              <thead className="bg-slate-100 sticky top-0">
                <tr><th className="p-3 border">שעות שינה</th><th className="p-3 border">איכות שינה</th><th className="p-3 border">פעילות שבוצעה לפני השינה</th></tr>
              </thead>
              <tbody>
                {sleepData.length === 0 ? <tr><td colSpan="3" className="p-4 text-center">אין נתונים</td></tr> :
                  sleepData.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50 border-t">
                      <td className="p-3 border">{d.hours}</td><td className="p-3 border">{d.quality}</td><td className="p-3 border">{Array.isArray(d.pre_sleep_activity) ? d.pre_sleep_activity.join(", ") : d.pre_sleep_activity}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => setView("menu")} className="w-full rounded-2xl border py-3 font-semibold">חזרה לתפריט</button>
        </div>
      </div>
    );
  }

  // ---------------- תפריט ראשי ----------------
  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white/95 p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">דשבורד מורה</h1>
            {context?.className && <p className="text-slate-500 font-bold mt-1">כיתה: {context.className}</p>}
          </div>
          <button onClick={onLogout} className="rounded-xl bg-slate-900 px-4 py-2 text-white font-semibold">התנתק</button>
        </div>
        <div className="space-y-5">
          <button onClick={handleFetchData} className="w-full rounded-2xl bg-indigo-600 py-6 text-xl font-bold text-white hover:opacity-95">צפייה בנתונים וייצוא</button>
          <button onClick={() => setView("addQuestions")} className="w-full rounded-2xl bg-emerald-600 py-6 text-xl font-bold text-white hover:opacity-95">הצעת שאלה חדשה</button>
        </div>
      </div>
    </div>
  );
}
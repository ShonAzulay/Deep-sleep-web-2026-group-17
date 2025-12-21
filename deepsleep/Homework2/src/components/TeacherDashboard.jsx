import { useState } from "react";
import * as XLSX from "xlsx";
import { teacherGetClassData, teacherSaveCustomQuestions } from "../services/teacherService";

export default function TeacherDashboard({ onLogout }) {
  const [view, setView] = useState("menu"); // "menu" | "addQuestions" | "viewData"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [sleepData, setSleepData] = useState([]);
  const [customQuestions, setCustomQuestions] = useState(["", "", "", "", ""]);

  // פונקציה לצפייה בנתונים
  async function handleFetchData() {
    setLoading(true);
    try {
      const data = await teacherGetClassData();
      setSleepData(data);
      setView("viewData");
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  // פונקציה לשמירת שאלות
  async function handleSaveQuestions() {
    setLoading(true);
    setMessage("");
    try {
      await teacherSaveCustomQuestions("teacher_123", "Class_A", customQuestions);
      setMessage("השאלות נשמרו בהצלחה וממתינות לאישור המנהלת.");
      setCustomQuestions(["", "", "", "", ""]);
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
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">הוספת שאלות כיתתיות</h1>
        

        <p className="text-center text-slate-600 mb-6 text-sm">
          ניתן להוסיף עד 5 שאלות ייחודיות לכיתה
        </p>

        <div className="space-y-3">
          {customQuestions.map((q, i) => (
            <input 
              key={i} 
              type="text" 
              placeholder={`שאלה ${i + 1}`} 
              value={q}
              onChange={(e) => {
                const n = [...customQuestions]; 
                n[i] = e.target.value; 
                setCustomQuestions(n);
              }} 
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          ))}
          
          <button 
            onClick={handleSaveQuestions} 
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 py-3 font-bold text-white disabled:opacity-50 mt-4 transition-all hover:opacity-90"
          >
            {loading ? "שומר..." : "שמור שאלות"}
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
                {sleepData.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50 border-t">
                    <td className="p-3 border">{d.hours}</td><td className="p-3 border">{d.quality}</td><td className="p-3 border">{d.pre_sleep_activity?.join(", ")}</td>
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
          <h1 className="text-3xl font-extrabold text-slate-900">דשבורד מורה</h1>
          <button onClick={onLogout} className="rounded-xl bg-slate-900 px-4 py-2 text-white font-semibold">התנתק</button>
        </div>
        <div className="space-y-5">
          <button onClick={handleFetchData} className="w-full rounded-2xl bg-indigo-600 py-6 text-xl font-bold text-white hover:opacity-95">צפייה בנתונים וייצוא</button>
          <button onClick={() => setView("addQuestions")} className="w-full rounded-2xl bg-emerald-600 py-6 text-xl font-bold text-white hover:opacity-95">הוספת שאלות כיתתיות</button>
        </div>
      </div>
    </div>
  );
}
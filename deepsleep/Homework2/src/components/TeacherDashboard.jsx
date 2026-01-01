import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { teacherGetClassData } from "../services/teacherService";
import { submitQuestionRequest } from "../services/classCustomizationService";

import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

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
      <SpaceLayout>
        <GlassCard className="w-full max-w-md" animateFloat={true} glowColor="emerald">
          <h1 className="text-2xl font-bold text-center text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">הצעת שאלה חדשה</h1>

          <p className="text-center text-indigo-200 mb-6 text-sm">
            הכנס את השאלה שברצונך להוסיף. השאלה תועבר לאישור מנהל המחקר.
          </p>

          <div className="space-y-3">
            <textarea
              placeholder="כתוב כאן את השאלה..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-emerald-400 outline-none min-h-[100px]"
            />

            <button
              onClick={handleSaveQuestion}
              disabled={loading || !questionText.trim()}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-bold text-white disabled:opacity-50 mt-4 transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]"
            >
              {loading ? "שולח..." : "שלח שאלה לאישור"}
            </button>

            {message && (
              <p className="text-center text-emerald-400 text-sm font-medium mt-2 bg-emerald-900/20 py-2 rounded-lg border border-emerald-500/30 animate-pulse">
                {message}
              </p>
            )}

            <button
              onClick={() => { setView("menu"); setMessage(""); }}
              className="w-full rounded-2xl border border-indigo-500/30 py-3 font-semibold text-indigo-200 transition-all hover:bg-white/5"
            >
              חזרה לתפריט
            </button>
          </div>
        </GlassCard>
      </SpaceLayout>
    );
  }
  // ---------------- תצוגת טבלת נתונים ----------------
  if (view === "viewData") {
    return (
      <SpaceLayout>
        <GlassCard className="w-full max-w-4xl" glowColor="emerald">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">נתונים כיתתיים (אנונימי)</h1>
            <button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">ייצוא לאקסל</button>
          </div>
          <div className="max-h-96 overflow-auto border border-indigo-500/30 rounded-xl mb-6 custom-scrollbar bg-indigo-950/30">
            <table className="w-full text-right border-collapse text-indigo-100">
              <thead className="bg-indigo-900/80 sticky top-0 text-white backdrop-blur-sm">
                <tr><th className="p-3 border-b border-indigo-500/30">שעות שינה</th><th className="p-3 border-b border-indigo-500/30">איכות שינה</th><th className="p-3 border-b border-indigo-500/30">פעילות שבוצעה לפני השינה</th></tr>
              </thead>
              <tbody>
                {sleepData.length === 0 ? <tr><td colSpan="3" className="p-4 text-center text-indigo-400">אין נתונים</td></tr> :
                  sleepData.map((d, i) => (
                    <tr key={i} className="hover:bg-white/5 border-b border-indigo-500/20 transition-colors">
                      <td className="p-3 border-l border-indigo-500/20">{d.hours}</td><td className="p-3 border-l border-indigo-500/20">{d.quality}</td><td className="p-3">{Array.isArray(d.pre_sleep_activity) ? d.pre_sleep_activity.join(", ") : d.pre_sleep_activity}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => setView("menu")} className="w-full rounded-2xl border border-indigo-500/30 py-3 font-semibold text-indigo-200 hover:bg-white/5 transition-colors">חזרה לתפריט</button>
        </GlassCard>
      </SpaceLayout>
    );
  }

  // ---------------- תפריט ראשי ----------------
  return (
    <SpaceLayout>
      <GlassCard className="w-full max-w-2xl" glowColor="emerald">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">דשבורד מורה</h1>
            {context?.className && <p className="text-emerald-400 font-bold mt-1 text-lg drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">כיתה: {context.className}</p>}
          </div>
          <button onClick={onLogout} className="rounded-xl border border-emerald-500/50 px-4 py-2 text-emerald-300 font-semibold hover:text-white hover:bg-emerald-500/10 transition-colors">התנתק</button>
        </div>
        <div className="space-y-6">
          <button onClick={handleFetchData} className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:scale-[1.02] transition-all group">
             📊 צפייה בנתונים וייצוא
          </button>
          <button onClick={() => setView("addQuestions")} className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] hover:scale-[1.02] transition-all group">
             📝 הצעת שאלה חדשה
          </button>
        </div>
      </GlassCard>
       {/* Footer Branding */}
      <div className="absolute bottom-4 text-emerald-500/30 text-xs font-mono tracking-widest pointer-events-none z-20">
        DEEP-SLEEP LABS // TEACHER PORTAL
      </div>
    </SpaceLayout>
  );
}
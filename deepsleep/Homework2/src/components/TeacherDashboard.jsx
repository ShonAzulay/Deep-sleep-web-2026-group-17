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

  // 5 Questions Slots
  const [questions, setQuestions] = useState(["", "", "", "", ""]);

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
  async function handleSaveQuestions() {
    if (!context?.experimentId || !context?.classId) {
      alert("חסר מידע על הניסוי/כיתה. אנא התחבר מחדש.");
      return;
    }

    const filledQuestions = questions.filter(q => q.trim() !== "");
    if (filledQuestions.length === 0) return;

    setLoading(true);
    setMessage("");

    try {
      // Shorthand: Send all non-empty questions
      // We could use Promise.all to send parallel
      const promises = filledQuestions.map(qText =>
        submitQuestionRequest(context.experimentId, context.classId, qText)
      );

      await Promise.all(promises);

      setMessage(`${filledQuestions.length} שאלות נשלחו בהצלחה וממתינות לאישור.`);
      setQuestions(["", "", "", "", ""]); // Reset
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleExport = () => {
    // Transform data for better Excel headers
    const exportData = sleepData.map(row => {
      const newRow = {
        "תאריך": row.date,
        "שעות שינה": row.total_sleep_estimate,
        "פעילות לפני שינה": Array.isArray(row.pre_sleep_activity) ? row.pre_sleep_activity.join(", ") : row.pre_sleep_activity,
        "איכות שינה": row.quality || "-"
      };

      // Handle Dynamic Questions with Categories
      Object.keys(row).forEach(key => {
        if (key.startsWith("custom_") && !key.endsWith("_category") && !key.endsWith("_text")) {
          // Found an answer key. Check for metadata.
          const category = row[`${key}_category`] || "כללי";
          const questionText = row[`${key}_text`] || "שאלה מותאמת";

          // Create a nice header: "[Nutrition] Did you eat?"
          const header = `[${category}] ${questionText}`;
          newRow[header] = row[key];
        }
      });

      return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ClassData");
    XLSX.writeFile(wb, "Class_Sleep_Report_With_Categories.xlsx");
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
            {questions.map((q, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -top-2 right-3 bg-indigo-900 text-xs text-indigo-300 px-2 rounded-full border border-indigo-500/30">
                  שאלה {idx + 1}
                </span>
                <input
                  type="text"
                  placeholder={`הכנס את תוכן שאלה ${idx + 1}...`}
                  value={q}
                  onChange={(e) => {
                    const newQs = [...questions];
                    newQs[idx] = e.target.value;
                    setQuestions(newQs);
                  }}
                  className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-emerald-400 outline-none mt-1"
                />
              </div>
            ))}

            <button
              onClick={handleSaveQuestions}
              disabled={loading || questions.every(q => !q.trim())}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-bold text-white disabled:opacity-50 mt-4 transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]"
            >
              {loading ? "שולח..." : "שלח שאלות לאישור"}
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
                <tr>
                  <th className="p-3 border-b border-indigo-500/30">שעות שינה</th>
                  <th className="p-3 border-b border-indigo-500/30">פעילות שבוצעה לפני השינה</th>
                </tr>
              </thead>
              <tbody>
                {sleepData.length === 0 ? <tr><td colSpan="2" className="p-4 text-center text-indigo-400">אין נתונים</td></tr> :
                  sleepData.map((d, i) => {
                    // Mappings for display
                    const hoursMap = {
                      "under_5": "פחות מ-5", "5_6": "5-6", "6_7": "6-7",
                      "7_8": "7-8", "8_9": "8-9", "over_9": "מעל 9"
                    };
                    const actMap = {
                      "phone": "טלפון", "computer": "מחשב", "tablet": "טאבלט",
                      "book": "ספר", "music": "מוזיקה", "other": "אחר"
                    };

                    // Format Activity
                    let activityDisplay = d.pre_sleep_activity;
                    if (Array.isArray(d.pre_sleep_activity)) {
                      activityDisplay = d.pre_sleep_activity.map(a => actMap[a] || a).join(", ");
                    } else if (typeof d.pre_sleep_activity === 'string') {
                      activityDisplay = actMap[d.pre_sleep_activity] || d.pre_sleep_activity;
                    }

                    return (
                      <tr key={i} className="hover:bg-white/5 border-b border-indigo-500/20 transition-colors">
                        <td className="p-3 border-l border-indigo-500/20">{hoursMap[d.total_sleep_estimate] || d.total_sleep_estimate || "-"}</td>
                        <td className="p-3">{activityDisplay || "-"}</td>
                      </tr>
                    );
                  })}
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
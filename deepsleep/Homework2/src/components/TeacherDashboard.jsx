import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { teacherGetClassData, teacherGetSubmissionCount } from "../services/teacherService";
import { submitQuestionRequest } from "../services/classCustomizationService";

import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

export default function TeacherDashboard({ onLogout }) {
  const [view, setView] = useState("menu"); // "menu" | "addQuestions"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [submissionCount, setSubmissionCount] = useState(0);

  // 5 Questions Slots
  const [questions, setQuestions] = useState(["", "", "", "", ""]);

  // Context from Session
  const [context, setContext] = useState(null);

  useEffect(() => {
    try {
      const userStr = sessionStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        setContext(user);
        // Load initial stats
        if (user.experimentId && user.classId) {
          loadStats(user.experimentId, user.classId);
        }
      }
    } catch (e) {
      console.error("Error parsing user context", e);
    }
  }, []);

  async function loadStats(expId, clsId) {
    const count = await teacherGetSubmissionCount(expId, clsId);
    setSubmissionCount(count);
  }

  // --- Handlers ---
  const handleExportReport = async () => {
    if (!context?.experimentId || !context?.classId) return;
    setLoading(true);
    try {
      const data = await teacherGetClassData(context.experimentId, context.classId);
      generateExcel(data);
      setMessage("הדוח ירד בהצלחה למחשב שלך");
    } catch (e) {
      console.error(e);
      alert("שגיאה בייצוא הדוח");
    } finally {
      setLoading(false);
    }
  };

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

  const generateExcel = (data) => {
    // Transform data for better Excel headers
    const exportData = data.map(row => {
      const newRow = {
        "User Code": row.studentId || row.id || "Anonymous", // Add ID first
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
    XLSX.writeFile(wb, `Class_${context.classId}_Report.xlsx`);
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
  // ---------------- תפריט ראשי ----------------
  return (
    <SpaceLayout>
      <GlassCard className="w-full max-w-2xl" glowColor="emerald">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">דשבורד מורה</h1>
            {context?.schoolName && <p className="text-emerald-200 text-sm mt-1">{context.schoolName}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-emerald-900/50 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30 font-mono text-sm">
                Class: {context?.classId}
              </span>
            </div>
          </div>
          <button onClick={onLogout} className="rounded-xl border border-emerald-500/50 px-4 py-2 text-emerald-300 font-semibold hover:text-white hover:bg-emerald-500/10 transition-colors">התנתק</button>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 p-6 rounded-2xl border border-indigo-500/30 mb-8 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(79,70,229,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <h2 className="text-indigo-200 text-lg font-bold mb-2">סה"כ דיווחים שהתקבלו</h2>
          <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            {submissionCount}
          </div>
          <p className="text-xs text-indigo-400 mt-2">נתונים בזמן אמת</p>
        </div>

        <button
          onClick={() => {
            if (context?.experimentId && context?.classId) {
              setSubmissionCount(0); // visual feedback
              loadStats(context.experimentId, context.classId);
            }
          }}
          className="text-xs text-indigo-400 hover:text-white underline mb-6"
        >
          רענן נתונים ↻
        </button>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleExportReport}
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-lg font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <span>מעבד נתונים...</span>
            ) : (
              <>
                <span>📥 הורד דוח כיתתי מלא (Excel)</span>
              </>
            )}
          </button>

          <div className="h-px bg-indigo-500/20 my-2"></div>

          <button onClick={() => setView("addQuestions")} className="w-full rounded-2xl border border-indigo-500/30 py-4 text-lg font-bold text-indigo-200 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2">
            <span>📝 הצעת שאלות חדשות</span>
          </button>

          <button
            onClick={() => {
              const origin = window.location.origin;
              const url = `${origin}/?experimentId=${context.experimentId}&classId=${context.classId}`;
              navigator.clipboard.writeText(url).then(() => {
                alert(`הקישור לתלמידים הועתק בהצלחה!\n${url}`);
              }).catch(err => {
                console.error("Failed to copy", err);
                prompt("העתק את הקישור ידנית:", url);
              });
            }}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-lg font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <span>🔗 העתק קישור להצטרפות תלמידים</span>
          </button>
        </div>
      </GlassCard>

      {/* Footer Branding & Debug Info */}
      <div className="absolute bottom-4 flex flex-col items-center">
        <div className="text-emerald-500/50 text-xs font-mono tracking-widest pointer-events-none z-20 mb-1">
          DEEP-SLEEP LABS // TEACHER PORTAL
        </div>
      </div>
    </SpaceLayout>
  );
}
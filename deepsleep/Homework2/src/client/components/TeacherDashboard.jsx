import { useState, useEffect } from "react";
import { teacherGetClassData, teacherGetSubmissionCount } from "../../server/services/teacherService";
import { generateClassReportExcel } from "../utils/excelGenerator";
import TeacherQuestionsForm from "./TeacherQuestionsForm";

import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

/**
 * TeacherDashboard Component
 * --------------------------
 * The main interface for teachers.
 * Responsibilities:
 * 1. View live submission counts for the class.
 * 2. Export class data to Excel via `handleExportReport`.
 * 3. Suggest new questions for the research manager to approve (handled by `TeacherQuestionsForm`).
 * 4. Generate invite links for students.
 */
import { useAppContext } from "../context/AppContext";

/**
 * TeacherDashboard Component
 * --------------------------
 * The main interface for teachers.
 * Responsibilities:
 * 1. View live submission counts for the class.
 * 2. Export class data to Excel via `handleExportReport`.
 * 3. Suggest new questions for the research manager to approve (handled by `TeacherQuestionsForm`).
 * 4. Generate invite links for students.
 */
export default function TeacherDashboard() {
  const { user, logout } = useAppContext();
  const [view, setView] = useState("menu"); // "menu" | "addQuestions"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [submissionCount, setSubmissionCount] = useState(0);

  // Load stats when user context is available
  useEffect(() => {
    if (user?.experimentId && user?.classId) {
      loadStats(user.experimentId, user.classId);
    }
  }, [user]);

  async function loadStats(expId, clsId) {
    const count = await teacherGetSubmissionCount(expId, clsId);
    setSubmissionCount(count);
  }

  // --- Handlers ---
  const handleExportReport = async () => {
    if (!user?.experimentId || !user?.classId) return;
    setLoading(true);
    try {
      const data = await teacherGetClassData(user.experimentId, user.classId);
      generateClassReportExcel(data, user.classId);
      setMessage("הדוח ירד בהצלחה למחשב שלך");
    } catch (e) {
      console.error(e);
      alert("שגיאה בייצוא הדוח");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const origin = window.location.origin;
    const url = `${origin}/?experimentId=${user.experimentId}&classId=${user.classId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert(`הקישור לתלמידים הועתק בהצלחה!\n${url}`);
    }).catch(err => {
      console.error("Failed to copy", err);
      prompt("העתק את הקישור ידנית:", url);
    });
  };

  // ---------------- תצוגת הוספת שאלות כיתתיות ----------------
  if (view === "addQuestions") {
    return (
      <TeacherQuestionsForm
        onBack={() => setView("menu")}
        context={user}
      />
    );
  }

  // ---------------- תפריט ראשי ----------------
  return (
    <SpaceLayout>
      <GlassCard className="w-full max-w-2xl" glowColor="emerald">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[color:var(--text-main)] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">דשבורד מורה</h1>
            {user?.schoolName && <p className="text-emerald-200 text-sm mt-1">{user.schoolName}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-emerald-900/50 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30 font-mono text-sm">
                Class: {user?.classId}
              </span>
            </div>
          </div>
          <button onClick={logout} className="rounded-xl border border-emerald-500/50 px-4 py-2 text-emerald-300 font-semibold hover:text-white hover:bg-emerald-500/10 transition-colors">התנתק</button>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/40 p-6 rounded-2xl border border-indigo-500/30 mb-8 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(79,70,229,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <h2 className="text-indigo-200 text-lg font-bold mb-2">סה"כ דיווחים שהתקבלו</h2>
          <div className="text-6xl font-black text-[color:var(--text-main)] drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            {submissionCount}
          </div>
          <p className="text-xs text-indigo-400 mt-2">נתונים בזמן אמת</p>
        </div>

        <button
          onClick={() => {
            if (user?.experimentId && user?.classId) {
              setSubmissionCount(0); // visual feedback
              loadStats(user.experimentId, user.classId);
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

          <button onClick={() => setView("addQuestions")} className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-4 text-lg font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
            <span>📝 הצעת שאלות חדשות</span>
          </button>

          <button
            onClick={handleCopyLink}
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
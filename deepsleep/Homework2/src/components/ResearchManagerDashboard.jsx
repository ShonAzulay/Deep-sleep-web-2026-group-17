import { useState, useEffect } from "react";
import ResearchStatsView from "./ResearchStatsView";
import {
  researchManagerCreateStudent,
  researchManagerDeleteStudent
} from "../services/researchManagerStudentUpload";
import {
  fetchPendingQuestions,
  approveQuestions
} from "../services/classCustomizationService";

import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

export default function ResearchManagerDashboard({ onLogout }) {
  const [view, setView] = useState("menu");

  // Context State
  const [experimentId, setExperimentId] = useState("Exp1");
  const [classId, setClassId] = useState("ClassA");

  // Student Management State
  const [studentUsername, setStudentUsername] = useState("");
  const [studentClassName, setStudentClassName] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Question Review State
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);
  // To handle edits, we will store a map of { id: editedText }
  const [editedTexts, setEditedTexts] = useState({});
  // Selected questions to approve (ids)
  const [selectedIds, setSelectedIds] = useState([]);

  const canSubmitCreate = studentUsername.trim() !== "" && studentClassName.trim() !== "" && studentPassword.trim() !== "" && !loading;
  const canSubmitDelete = studentUsername.trim() !== "" && studentClassName.trim() !== "" && !loading;

  // --- Effects ---
  useEffect(() => {
    if (view === "questions") {
      loadQuestions();
    }
  }, [view, experimentId, classId]);

  async function loadQuestions() {
    setLoadingQ(true);
    setPendingQuestions([]);
    setEditedTexts({});
    setSelectedIds([]);
    try {
      const data = await fetchPendingQuestions(experimentId, classId);
      setPendingQuestions(data);
      // Initialize edited texts with original texts
      const initialEdits = {};
      data.forEach(q => initialEdits[q.id] = q.text);
      setEditedTexts(initialEdits);
    } catch (err) {
      console.error(err);
      setError("שגיאה בטעינת שאלות");
    } finally {
      setLoadingQ(false);
    }
  }

  // --- Handlers ---

  async function handleCreateStudent() {
    setError(""); setMessage(""); setLoading(true);
    try {
      const newId = await researchManagerCreateStudent({
        experimentId,
        classId,
        username: studentUsername,
        className: studentClassName,
        password: studentPassword
      });
      setMessage(`תלמיד נוצר בהצלחה (id: ${newId})`);
      setStudentUsername(""); setStudentClassName(""); setStudentPassword("");
    } catch (e) { setError(e?.message || "שגיאה ביצירת תלמיד"); } finally { setLoading(false); }
  }

  async function handleDeleteStudent() {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את ${studentUsername}?`)) return;
    setError(""); setMessage(""); setLoading(true);
    try {
      await researchManagerDeleteStudent(experimentId, classId, studentUsername);
      setMessage(`התלמיד ${studentUsername} נמחק בהצלחה`);
      setStudentUsername(""); setStudentClassName("");
    } catch (e) { setError(e?.message || "שגיאה במחיקת תלמיד"); } finally { setLoading(false); }
  }

  async function handleApproveSelected() {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      // Build the list of approved questions with their FINAL (edited) text
      const questionsToApprove = selectedIds.map(id => ({
        originalId: id,
        finalText: editedTexts[id]
      }));

      await approveQuestions(experimentId, classId, questionsToApprove);

      setMessage(`${selectedIds.length} שאלות אושרו בהצלחה!`);
      // Refresh list
      loadQuestions();
    } catch (e) {
      setError("שגיאה באישור השאלות");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const toggleSelectQuestion = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // --- Render Views ---

  if (view === "stats") {
    return <ResearchStatsView onBack={() => setView("menu")} />;
  }

  // --- Common Wrapper for Dashboard Pages (except stats) ---
  const renderHeader = (title) => (
    <div className="mb-8 relative z-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{title}</h1>

      {/* Context Selection Bar */}
      <div className="glass-panel p-4 rounded-xl mb-4 text-sm flex gap-3 flex-wrap border border-indigo-500/30">
        <div className="flex flex-col flex-1 min-w-[120px]">
          <label className="font-bold text-indigo-300 mb-1">Experiment ID</label>
          <input
            type="text"
            value={experimentId}
            onChange={e => setExperimentId(e.target.value)}
            className="bg-indigo-950/50 border border-indigo-500/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
          />
        </div>
        <div className="flex flex-col flex-1 min-w-[120px]">
          <label className="font-bold text-indigo-300 mb-1">Class ID</label>
          <input
            type="text"
            value={classId}
            onChange={e => setClassId(e.target.value)}
            className="bg-indigo-950/50 border border-indigo-500/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
          />
        </div>
      </div>
      {(error || message) && (
        <div className="text-center mb-4">
          {error && <p className="text-red-400 font-bold bg-red-900/20 py-2 rounded-lg border border-red-500/30">{error}</p>}
          {message && <p className="text-emerald-400 font-bold bg-emerald-900/20 py-2 rounded-lg border border-emerald-500/30">{message}</p>}
        </div>
      )}
    </div>
  );

  if (view === "questions") {
    return (
      <SpaceLayout>
        <GlassCard className="w-full max-w-2xl" animateFloat={true} glowColor="indigo">
          {renderHeader("ניהול בקשות לשאלות כיתתיות")}

          <div className="mb-6">
            <p className="text-indigo-200 text-sm mb-4">
              סמן V ליד השאלות לאישור, ערוך את הטקסט במידת הצורך, ולחץ על "אשר מסומנים".
            </p>
            {loadingQ ? <p className="text-white">טוען...</p> : (
              <div className="space-y-4 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                {pendingQuestions.length === 0 && <p className="text-center text-indigo-400/70 py-4">אין בקשות ממתינות</p>}

                {pendingQuestions.map(q => (
                  <div key={q.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${selectedIds.includes(q.id) ? 'bg-indigo-600/30 border-cyan-400' : 'bg-indigo-950/30 border-indigo-500/20'}`}>
                    <input
                      type="checkbox"
                      className="mt-2 h-5 w-5 accent-cyan-400"
                      checked={selectedIds.includes(q.id)}
                      onChange={() => toggleSelectQuestion(q.id)}
                    />
                    <div className="flex-1">
                      <p className="text-xs text-indigo-400 mb-1">נשלח: {q?.createdAt?.toDate?.()?.toLocaleString()}</p>
                      <textarea
                        className="w-full bg-indigo-950/60 border border-indigo-500/30 rounded-lg p-2 text-white font-medium focus:ring-2 focus:ring-cyan-400 outline-none resize-none"
                        value={editedTexts[q.id] || ""}
                        onChange={(e) => setEditedTexts({ ...editedTexts, [q.id]: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleApproveSelected}
            disabled={loading || selectedIds.length === 0}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 py-3 font-bold text-white mb-3 disabled:opacity-50 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] transition-all"
          >
            {loading ? "מעבד..." : `אשר ${selectedIds.length} שאלות מסומנות`}
          </button>

          <button onClick={() => setView("menu")} className="w-full rounded-2xl border border-indigo-500/30 py-3 font-semibold text-indigo-200 hover:bg-white/5 transition-colors">
            חזרה לתפריט
          </button>
        </GlassCard>
      </SpaceLayout>
    );
  }

  if (view === "createStudent" || view === "deleteStudent") {
    const isDelete = view === "deleteStudent";
    return (
      <SpaceLayout>
        <GlassCard className="w-full max-w-md" animateFloat={true} glowColor="indigo">
          {renderHeader(isDelete ? "מחיקת תלמיד" : "הכנסת תלמיד")}

          <p className="mb-6 text-center text-sm text-indigo-300">{isDelete ? "הזן שם משתמש לזיהוי." : "הזן פרטים ליצירת תלמיד חדש."}</p>
          <div className="space-y-4">
            <input type="text" placeholder="שם משתמש (User ID)" value={studentUsername} onChange={(e) => setStudentUsername(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
            <input type="text" placeholder="שם הכיתה (UI Label)" value={studentClassName} onChange={(e) => setStudentClassName(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
            {!isDelete && (<input type="password" placeholder="סיסמה" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />)}

            <button disabled={isDelete ? !canSubmitDelete : !canSubmitCreate} onClick={isDelete ? handleDeleteStudent : handleCreateStudent} className={`w-full rounded-2xl py-3 font-semibold text-white disabled:opacity-40 shadow-lg transition-all hover:scale-[1.02] ${isDelete ? 'bg-gradient-to-r from-rose-600 to-red-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]' : 'bg-gradient-to-r from-emerald-600 to-green-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]'}`}>{loading ? "מבצע..." : (isDelete ? "מחק תלמיד" : "צור תלמיד")}</button>

            <button onClick={() => { setView("menu"); setError(""); setMessage(""); setStudentUsername(""); setStudentClassName(""); setStudentPassword(""); }} className="w-full rounded-2xl border border-indigo-500/30 py-3 font-semibold text-indigo-200 hover:bg-white/5 transition-colors">חזרה לתפריט</button>
          </div>
        </GlassCard>
      </SpaceLayout>
    );
  }

  // Main Menu
  return (
    <SpaceLayout>
      <GlassCard className="w-full max-w-2xl" glowColor="indigo">
        <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
          <div><h1 className="text-3xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">דשבורד מנהל מחקר</h1></div>
          <button onClick={onLogout} className="rounded-xl border border-indigo-500/50 px-4 py-2 font-semibold text-indigo-300 hover:text-white hover:bg-white/5 transition-colors">התנתק</button>
        </div>

        {/* Context Display in Menu */}
        <div className="mt-6 bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/30 relative z-10 backdrop-blur-sm">
          <p className="text-center font-bold text-indigo-200 mb-2">עובד על:</p>
          <div className="flex gap-4 justify-center">
            <div className="text-center">
              <span className="text-xs text-indigo-400 uppercase tracking-wider">Experiment</span>
              <div className="font-mono font-bold text-cyan-400 bg-indigo-900/50 px-3 py-1 rounded border border-indigo-500/30 shadow-[0_0_10px_rgba(0,243,255,0.2)]">{experimentId}</div>
            </div>
            <div className="text-center">
              <span className="text-xs text-indigo-400 uppercase tracking-wider">Class</span>
              <div className="font-mono font-bold text-cyan-400 bg-indigo-900/50 px-3 py-1 rounded border border-indigo-500/30 shadow-[0_0_10px_rgba(0,243,255,0.2)]">{classId}</div>
            </div>
          </div>
          <p className="text-center text-xs text-indigo-500 mt-2">(ניתן לשנות במסכים הפנימיים)</p>
        </div>

        <div className="mt-8 space-y-5 relative z-10">
          <button type="button" onClick={() => setView("stats")} className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:scale-[1.02] transition-all">📊 צפייה בסטטיסטיקה</button>
          <button type="button" onClick={() => setView("questions")} className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:scale-[1.02] transition-all">📝 ניהול שאלות ממתינות</button>
          <button type="button" onClick={() => setView("createStudent")} className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] hover:scale-[1.02] transition-all">➕ הכנסת תלמיד</button>
          <button type="button" onClick={() => setView("deleteStudent")} className="w-full rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] hover:scale-[1.02] transition-all">🗑️ מחיקת תלמיד</button>
        </div>
      </GlassCard>
      
      {/* Footer Branding */}
      <div className="absolute bottom-4 text-indigo-500/30 text-xs font-mono tracking-widest pointer-events-none z-20">
        DEEP-SLEEP LABS // MANAGER PORTAL
      </div>
    </SpaceLayout>
  );
}
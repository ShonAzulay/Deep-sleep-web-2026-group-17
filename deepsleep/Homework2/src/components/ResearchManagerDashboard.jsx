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
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-4 text-center">{title}</h1>

      {/* Context Selection Bar */}
      <div className="bg-slate-100 p-4 rounded-xl mb-4 text-sm flex gap-3 flex-wrap">
        <div className="flex flex-col flex-1 min-w-[120px]">
          <label className="font-bold text-slate-600 mb-1">Experiment ID</label>
          <input
            type="text"
            value={experimentId}
            onChange={e => setExperimentId(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col flex-1 min-w-[120px]">
          <label className="font-bold text-slate-600 mb-1">Class ID</label>
          <input
            type="text"
            value={classId}
            onChange={e => setClassId(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>
      {(error || message) && (
        <div className="text-center mb-4">
          {error && <p className="text-red-600 font-medium">{error}</p>}
          {message && <p className="text-emerald-700 font-medium">{message}</p>}
        </div>
      )}
    </div>
  );

  if (view === "questions") {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="w-full max-w-2xl rounded-3xl bg-white/95 p-6 shadow-2xl">
          {renderHeader("ניהול בקשות לשאלות כיתתיות")}

          <div className="mb-4">
            <p className="text-slate-600 text-sm mb-4">
              סמן V ליד השאלות לאישור, ערוך את הטקסט במידת הצורך, ולחץ על "אשר מסומנים".
            </p>
            {loadingQ ? <p>טוען...</p> : (
              <div className="space-y-4 max-h-[400px] overflow-auto">
                {pendingQuestions.length === 0 && <p className="text-center text-slate-500">אין בקשות ממתינות</p>}

                {pendingQuestions.map(q => (
                  <div key={q.id} className={`flex items-start gap-3 p-3 rounded-xl border ${selectedIds.includes(q.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-white'}`}>
                    <input
                      type="checkbox"
                      className="mt-2 h-5 w-5"
                      checked={selectedIds.includes(q.id)}
                      onChange={() => toggleSelectQuestion(q.id)}
                    />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-1">נשלח: {q?.createdAt?.toDate?.()?.toLocaleString()}</p>
                      <textarea
                        className="w-full border rounded p-2 text-slate-900 font-medium focus:ring-2 focus:ring-indigo-200"
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
            className="w-full rounded-2xl bg-indigo-600 py-3 font-bold text-white mb-3 disabled:opacity-50"
          >
            {loading ? "מעבד..." : `אשר ${selectedIds.length} שאלות מסומנות`}
          </button>

          <button onClick={() => setView("menu")} className="w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white">
            חזרה לתפריט
          </button>
        </div>
      </div>
    );
  }

  if (view === "createStudent" || view === "deleteStudent") {
    const isDelete = view === "deleteStudent";
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur">
          {renderHeader(isDelete ? "מחיקת תלמיד" : "הכנסת תלמיד")}

          <p className="mb-6 text-center text-sm text-slate-500">{isDelete ? "הזן שם משתמש לזיהוי." : "הזן פרטים ליצירת תלמיד חדש."}</p>
          <div className="space-y-4">
            <input type="text" placeholder="שם משתמש (User ID)" value={studentUsername} onChange={(e) => setStudentUsername(e.target.value)} className="w-full rounded-xl border px-4 py-3" />
            <input type="text" placeholder="שם הכיתה (UI Label)" value={studentClassName} onChange={(e) => setStudentClassName(e.target.value)} className="w-full rounded-xl border px-4 py-3" />
            {!isDelete && (<input type="password" placeholder="סיסמה" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} className="w-full rounded-xl border px-4 py-3" />)}

            <button disabled={isDelete ? !canSubmitDelete : !canSubmitCreate} onClick={isDelete ? handleDeleteStudent : handleCreateStudent} className={`w-full rounded-2xl py-3 font-semibold text-white disabled:opacity-40 ${isDelete ? 'bg-rose-600' : 'bg-emerald-600'}`}>{loading ? "מבצע..." : (isDelete ? "מחק תלמיד" : "צור תלמיד")}</button>

            <button onClick={() => { setView("menu"); setError(""); setMessage(""); setStudentUsername(""); setStudentClassName(""); setStudentPassword(""); }} className="w-full rounded-2xl border py-3 font-semibold text-slate-800">חזרה לתפריט</button>
          </div>
        </div>
      </div>
    );
  }

  // Main Menu
  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white/95 p-6 sm:p-10 shadow-2xl backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div><h1 className="text-3xl font-extrabold text-slate-900">דשבורד מנהל מחקר</h1></div>
          <button onClick={onLogout} className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white">התנתק</button>
        </div>

        {/* Context Display in Menu */}
        <div className="mt-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <p className="text-center font-bold text-indigo-900 mb-2">עובד על:</p>
          <div className="flex gap-4 justify-center">
            <div className="text-center">
              <span className="text-xs text-indigo-500 uppercase">Experiment</span>
              <div className="font-mono font-bold bg-white px-2 py-1 rounded border">{experimentId}</div>
            </div>
            <div className="text-center">
              <span className="text-xs text-indigo-500 uppercase">Class</span>
              <div className="font-mono font-bold bg-white px-2 py-1 rounded border">{classId}</div>
            </div>
          </div>
          <p className="text-center text-xs text-indigo-400 mt-2">(ניתן לשנות במסכים הפנימיים)</p>
        </div>

        <div className="mt-8 space-y-5">
          <button type="button" onClick={() => setView("stats")} className="w-full rounded-2xl bg-indigo-600 py-6 text-xl font-bold text-white hover:opacity-95">צפייה בסטטיסטיקה</button>
          <button type="button" onClick={() => setView("questions")} className="w-full rounded-2xl bg-sky-600 py-6 text-xl font-bold text-white hover:opacity-95">ניהול שאלות ממתינות</button>
          <button type="button" onClick={() => setView("createStudent")} className="w-full rounded-2xl bg-emerald-600 py-6 text-xl font-bold text-white hover:opacity-95">הכנסת תלמיד</button>
          <button type="button" onClick={() => setView("deleteStudent")} className="w-full rounded-2xl bg-rose-600 py-6 text-xl font-bold text-white hover:opacity-95">מחיקת תלמיד</button>
        </div>
      </div>
    </div>
  );
}
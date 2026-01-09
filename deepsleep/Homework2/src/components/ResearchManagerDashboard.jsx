import { useState, useEffect } from "react";
import ResearchStatsView from "./ResearchStatsView";
import ResearchReportsView from "./ResearchReportsView";
import {
  researchManagerCreateStudent,
  researchManagerDeleteStudent
} from "../services/researchManagerStudentUpload";
import {
  fetchPendingQuestions,
  approveQuestions
} from "../services/classCustomizationService";
import { researchManagerCreateTeacher } from "../services/teacherManagementService";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

export default function ResearchManagerDashboard({ onLogout }) {
  const CATEGORIES = [
    { id: "focus", label: "ריכוז" },
    { id: "nutrition", label: "תזונה" },
    { id: "mental", label: "חוויה נפשית" },
    { id: "environment", label: "הפרעות סביבתיות" },
    { id: "exercise", label: "פעילות גופנית" },
    { id: "general", label: "כללי/אחר" }
  ];

  const [view, setView] = useState("menu");

  // Context State
  const [experimentId, setExperimentId] = useState("Exp1");
  const [classId, setClassId] = useState("ClassA");

  // Classes State
  const [classesList, setClassesList] = useState([]);

  // Experiment List State
  const [experimentsList, setExperimentsList] = useState([]);
  const [showExpList, setShowExpList] = useState(false);

  async function fetchExperiments() {
    try {
      const colRef = collection(db, "experiments");
      const snap = await getDocs(colRef);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setExperimentsList(list);
    } catch (err) {
      console.error("Error fetching experiments:", err);
    }
  }

  // Student Management State
  const [studentUsername, setStudentUsername] = useState("");
  // Student Hierarchy State
  const [studentSchoolName, setStudentSchoolName] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [studentClassNum, setStudentClassNum] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // Teacher Management State
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [classNumber, setClassNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Question Review State
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(false);
  // To handle edits, we will store a map of { id: editedText }
  const [editedTexts, setEditedTexts] = useState({});
  // To handle categories, we will store a map of { id: categoryId }
  const [questionCategories, setQuestionCategories] = useState({});
  // To handle types and options
  const [questionTypes, setQuestionTypes] = useState({}); // { id: 'text' | 'select' }
  const [questionOptions, setQuestionOptions] = useState({}); // { id: "opt1, opt2" }
  // Selected questions to approve (ids)
  const [selectedIds, setSelectedIds] = useState([]);

  const canSubmitCreate = studentUsername.trim() && studentPassword.trim() && studentSchoolName.trim() && studentGrade.trim() && studentClassNum.trim() && !loading;
  const canSubmitDelete = studentUsername.trim() !== "" && !loading;
  const canSubmitCreateTeacher = teacherName.trim() && teacherEmail.trim() && teacherPassword.trim() && schoolName.trim() && gradeLevel.trim() && classNumber.trim() && !loading;

  // --- Effects ---
  useEffect(() => {
    if (view === "questions") {
      loadQuestions();
    }
    if (view === "classes") {
      fetchClasses();
    }
  }, [view, experimentId]);

  async function fetchClasses() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const colRef = collection(db, "experiments", experimentId, "classes");
      const snap = await getDocs(colRef);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setClassesList(list);
    } catch (err) {
      console.error(err);
      setError("שגיאה בטעינת כיתות. וודא שה ID של הניסוי נכון.");
    } finally {
      setLoading(false);
    }
  }

  async function loadQuestions() {
    setLoadingQ(true);
    setError("");
    setMessage("");
    setPendingQuestions([]);
    setEditedTexts({});
    setQuestionCategories({});
    setQuestionTypes({});
    setQuestionOptions({});
    setSelectedIds([]);
    try {
      // Fetch ALL pending questions from ALL classes
      const data = await fetchPendingQuestions();
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

  // Create Class State
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [newClassNum, setNewClassNum] = useState("");

  const canSubmitCreateClass = newSchoolName.trim() && newGrade && newClassNum;

  async function handleCreateClass() {
    if (!canSubmitCreateClass) return;
    setLoading(true);
    try {
      // Dynamic import to allow db access if not available in scope
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");

      const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\u0590-\u05FF]/g, '');
      const safeSchool = sanitize(newSchoolName);
      const safeGrade = sanitize(newGrade);
      const safeClassNum = sanitize(newClassNum);
      const newClassId = `${safeSchool}_${safeGrade}_${safeClassNum}`;

      // 1. Ensure ROOT Experiment Document Exists (for List Feature)
      await setDoc(doc(db, "experiments", experimentId), {
        lastUpdated: serverTimestamp(),
        id: experimentId
      }, { merge: true });

      // 2. Create Class Document
      await setDoc(doc(db, "experiments", experimentId, "classes", newClassId), {
        schoolName: newSchoolName,
        grade: newGrade,
        classNum: newClassNum,
        createdAt: serverTimestamp(),
        experimentId: experimentId
      });

      setMessage(`כיתה ${newClassId} נוצרה בהצלחה!`);
      setNewSchoolName(""); setNewGrade(""); setNewClassNum("");
      fetchClasses(); // Refresh list
    } catch (err) {
      console.error(err);
      setError("שגיאה ביצירת כיתה");
    } finally {
      setLoading(false);
    }
  }

  // --- Handlers ---
  const handleCopyLink = (cls) => {
    const origin = window.location.origin;
    const url = `${origin}/?experimentId=${experimentId}&classId=${cls.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert(`הקישור לכיתה הועתק בהצלחה!\n${url}`);
    }).catch(err => {
      console.error("Failed to copy", err);
      prompt("העתק את הקישור ידנית:", url);
    });
  };

  async function handleDeleteStudent() {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את ${studentUsername}?`)) return;
    setError(""); setMessage(""); setLoading(true);
    try {
      const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\u0590-\u05FF]/g, '');
      const derivedClassId = `${sanitize(studentSchoolName)}_${sanitize(studentGrade)}_${sanitize(studentClassNum)}`;

      await researchManagerDeleteStudent(experimentId, derivedClassId, studentUsername);
      setMessage(`התלמיד ${studentUsername} נמחק בהצלחה`);
      setStudentUsername("");
    } catch (e) { setError("למחיקה, וודא שכל פרטי הכיתה והשם משתמש מלאים ונכונים."); } finally { setLoading(false); }
  }

  async function handleCreateTeacher() {
    setError(""); setMessage(""); setLoading(true);
    try {
      const result = await researchManagerCreateTeacher({
        experimentId,
        teacherName,
        email: teacherEmail,
        password: teacherPassword,
        schoolName,
        grade: gradeLevel,
        classNum: classNumber
      });
      setMessage(`מורה נוצר בהצלחה!\n(ClassID: ${result.classId})`);
      setTeacherName(""); setTeacherEmail(""); setTeacherPassword(""); setSchoolName(""); setGradeLevel(""); setClassNumber("");
    } catch (e) { setError(e?.message || "שגיאה ביצירת מורה"); } finally { setLoading(false); }
  }

  async function handleApproveSelected() {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      const questionsToApprove = selectedIds.map(id => {
        const originalQ = pendingQuestions.find(q => q.id === id);
        const type = questionTypes[id] || "text";
        const optionsRaw = questionOptions[id] || "";
        const options = type === "select" ? optionsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

        return {
          originalId: id,
          finalText: editedTexts[id],
          category: questionCategories[id] || "general",
          type: type,
          options: options,
          classId: originalQ?.classId,
          experimentId: originalQ?.experimentId
        };
      });

      await approveQuestions(questionsToApprove);

      setMessage(`${selectedIds.length} שאלות אושרו בהצלחה!`);
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

  if (view === "reports") {
    return <ResearchReportsView onBack={() => setView("menu")} />;
  }

  if (view === "stats") {
    return <ResearchStatsView onBack={() => setView("menu")} />;
  }

  // --- Common Wrapper for Dashboard Pages (except stats) ---
  const renderHeader = (title) => (
    <div className="mb-8 relative z-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{title}</h1>

      <div className="glass-panel p-4 rounded-xl mb-4 text-sm flex gap-3 flex-wrap border border-indigo-500/30">
        <div className="flex flex-col flex-1 min-w-[200px] relative">
          <label className="font-bold text-indigo-300 mb-1">Experiment ID (ליצירת משתמשים)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={experimentId}
              onChange={e => setExperimentId(e.target.value)}
              className="flex-1 bg-indigo-950/50 border border-indigo-500/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
            />
            <button
              onClick={() => {
                if (!showExpList) fetchExperiments();
                setShowExpList(!showExpList);
              }}
              className="bg-indigo-800/80 hover:bg-indigo-700 text-cyan-300 px-3 py-2 rounded-lg border border-indigo-500/50 transition-colors"
              title="בחר מתוך רשימה"
            >
              📂
            </button>
          </div>

          {/* Experiment List Dropdown */}
          {showExpList && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-cyan-500/30 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-md">
              <div className="p-2 border-b border-white/10 flex justify-between items-center">
                <span className="text-xs text-indigo-300 font-bold">בחר ניסוי:</span>
                <button onClick={() => setShowExpList(false)} className="text-xs text-red-400 hover:text-red-300">סגור</button>
              </div>
              <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                {experimentsList.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-xs">לא נמצאו ניסויים</div>
                ) : (
                  experimentsList.map(exp => (
                    <button
                      key={exp.id}
                      onClick={() => {
                        setExperimentId(exp.id);
                        setShowExpList(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-indigo-100 hover:bg-cyan-900/30 hover:text-cyan-300 transition-colors border-b border-white/5 last:border-0"
                    >
                      {exp.id}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
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

  if (view === "classes") {
    return (
      <SpaceLayout>
        <GlassCard className="w-full max-w-4xl" animateFloat={true} glowColor="cyan">
          {renderHeader("ניהול כיתות וקישורים")}

          <div className="flex justify-between items-center mb-6">
            <p className="text-indigo-200">רשימת הכיתות בניסוי: <b>{experimentId}</b></p>
            <button onClick={fetchClasses} className="text-cyan-400 hover:underline text-sm">רענן רשימה</button>
          </div>

          {/* Create Class Form */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">➕ הוספת כיתה חדשה</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                placeholder="שם בית ספר"
                value={newSchoolName}
                onChange={e => setNewSchoolName(e.target.value)}
                className="bg-indigo-950/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              />
              <select
                value={newGrade}
                onChange={e => setNewGrade(e.target.value)}
                className="bg-indigo-950/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              >
                <option value="" disabled>שכבה</option>
                {["ז", "ח", "ט", "י", "יא", "יב", "יג", "יד"].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select
                value={newClassNum}
                onChange={e => setNewClassNum(e.target.value)}
                className="bg-indigo-950/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              >
                <option value="" disabled>מס'</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <button
                onClick={handleCreateClass}
                disabled={!canSubmitCreateClass || loading}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg py-2 disabled:opacity-50 transition-colors"
              >
                {loading ? "יוצר..." : "צור כיתה"}
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {loading && <p className="text-white text-center">טוען...</p>}
            {!loading && classesList.length === 0 && <p className="text-indigo-400 text-center py-8">לא נמצאו כיתות בניסוי זה.</p>}

            {classesList.map(cls => (
              <div key={cls.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-white/10 transition-colors">
                <div className="text-right">
                  <div className="font-bold text-white text-lg">{cls.id}</div>
                  <div className="text-sm text-indigo-300">
                    {cls.schoolName ? `${cls.schoolName} - ${cls.grade}'${cls.classNum}` : '(פרטים חסרים)'}
                  </div>
                </div>

                <button
                  onClick={() => handleCopyLink(cls)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-bold hover:scale-105 transition-transform shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                >
                  <span>🔗 העתק קישור לכיתה</span>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-indigo-500/30">
            <button onClick={() => setView("menu")} className="w-full rounded-2xl border border-indigo-500/30 py-3 font-semibold text-indigo-200 hover:bg-white/5 transition-colors">
              חזרה לתפריט
            </button>
          </div>
        </GlassCard>
      </SpaceLayout>
    );
  }

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
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs text-indigo-400">נשלח: {q?.createdAt?.toDate?.()?.toLocaleString()}</p>
                        <span className="text-[10px] font-mono bg-indigo-800/80 text-cyan-300 px-2 py-0.5 rounded border border-indigo-600">
                          {q.classId}
                        </span>
                      </div>
                      <textarea
                        className="w-full bg-indigo-950/60 border border-indigo-500/30 rounded-lg p-2 text-white font-medium focus:ring-2 focus:ring-cyan-400 outline-none resize-none mb-2"
                        value={editedTexts[q.id] || ""}
                        onChange={(e) => setEditedTexts({ ...editedTexts, [q.id]: e.target.value })}
                        rows={2}
                      />
                      <select
                        className="w-full bg-indigo-950/60 border border-indigo-500/30 rounded-lg p-2 text-xs text-indigo-200 outline-none focus:ring-2 focus:ring-cyan-400"
                        value={questionCategories[q.id] || ""}
                        onChange={(e) => setQuestionCategories({ ...questionCategories, [q.id]: e.target.value })}
                      >
                        <option value="" disabled>-- בחר קטגוריה --</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>

                      <div className="flex gap-2 mt-2">
                        <select
                          className="w-1/3 bg-indigo-950/60 border border-indigo-500/30 rounded-lg p-2 text-xs text-indigo-200 outline-none focus:ring-2 focus:ring-cyan-400"
                          value={questionTypes[q.id] || "text"}
                          onChange={(e) => setQuestionTypes({ ...questionTypes, [q.id]: e.target.value })}
                        >
                          <option value="text">טקסט פתוח</option>
                          <option value="select">בחירה (Select)</option>
                        </select>

                        {(questionTypes[q.id] === "select") && (
                          <input
                            type="text"
                            placeholder="אפשרויות (מופרד בפסיק)"
                            className="flex-1 bg-indigo-950/60 border border-indigo-500/30 rounded-lg p-2 text-xs text-white placeholder-indigo-400/50 outline-none focus:ring-2 focus:ring-cyan-400"
                            value={questionOptions[q.id] || ""}
                            onChange={(e) => setQuestionOptions({ ...questionOptions, [q.id]: e.target.value })}
                          />
                        )}
                      </div>
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

  if (view === "createTeacher") {
    return (
      <SpaceLayout>
        <GlassCard className="w-full max-w-md" animateFloat={true} glowColor="indigo">
          {renderHeader("הכנסת מורה חדש")}

          <p className="mb-6 text-center text-sm text-indigo-300">הזן את פרטי המורה והכיתה.</p>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
            <div className="space-y-2">
              <label className="text-xs text-indigo-400 font-bold uppercase">פרטי מורה</label>
              <input type="text" placeholder="שם מלא" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
              <input type="email" placeholder="אימייל (שם משתמש)" value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
              <input type="password" placeholder="סיסמה ראשונית" value={teacherPassword} onChange={(e) => setTeacherPassword(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
            </div>

            <div className="h-px bg-indigo-500/30 my-2" />

            <div className="space-y-2">
              <label className="text-xs text-indigo-400 font-bold uppercase">שיוך כיתתי (היררכיה)</label>
              <input type="text" placeholder="שם בית הספר" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
              <input type="text" placeholder="שכבה (לדוגמה: יא)" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
              <input type="text" placeholder="מספר כיתה (לדוגמה: 3)" value={classNumber} onChange={(e) => setClassNumber(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
            </div>

            <button disabled={!canSubmitCreateTeacher} onClick={handleCreateTeacher} className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 mt-4 py-3 font-semibold text-white disabled:opacity-40 shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all hover:scale-[1.02]">
              {loading ? "מבצע..." : "צור מורה ושייך לכיתה"}
            </button>

            <button onClick={() => { setView("menu"); setError(""); setMessage(""); }} className="w-full rounded-2xl border border-indigo-500/30 py-3 font-semibold text-indigo-200 hover:bg-white/5 transition-colors">חזרה לתפריט</button>
          </div>
        </GlassCard>
      </SpaceLayout>
    );
  }

  if (view === "deleteStudent") {
    // const isDelete = view === "deleteStudent"; // Always true now
    return (
      <SpaceLayout>
        <GlassCard className="w-full max-w-md" animateFloat={true} glowColor="indigo">
          {renderHeader("מחיקת תלמיד")}

          <p className="mb-6 text-center text-sm text-indigo-300">הזן שם משתמש לזיהוי.</p>
          <div className="space-y-4">
            <input type="text" placeholder="שם משתמש (User ID)" value={studentUsername} onChange={(e) => setStudentUsername(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />

            <div className="bg-indigo-900/20 p-3 rounded-xl border border-indigo-500/20 space-y-2">
              <p className="text-xs text-indigo-400 font-bold uppercase mb-1">שיוך לכיתה (חובה למלא במדויק למחיקה)</p>
              <input type="text" placeholder="שם בית הספר" value={studentSchoolName} onChange={(e) => setStudentSchoolName(e.target.value)} className="w-full rounded-lg bg-indigo-950/50 border border-indigo-500/30 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-400 outline-none" />
              <div className="flex gap-2">
                <input type="text" placeholder="שכבה" value={studentGrade} onChange={(e) => setStudentGrade(e.target.value)} className="flex-1 rounded-lg bg-indigo-950/50 border border-indigo-500/30 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-400 outline-none" />
                <input type="text" placeholder="מס' כיתה" value={studentClassNum} onChange={(e) => setStudentClassNum(e.target.value)} className="flex-1 rounded-lg bg-indigo-950/50 border border-indigo-500/30 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-400 outline-none" />
              </div>
            </div>

            <button disabled={!canSubmitDelete} onClick={handleDeleteStudent} className={`w-full rounded-2xl py-3 font-semibold text-white disabled:opacity-40 shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-r from-rose-600 to-red-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]`}>{loading ? "מבצע..." : "מחק תלמיד"}</button>

            <button onClick={() => { setView("menu"); setError(""); setMessage(""); setStudentUsername(""); setStudentSchoolName(""); setStudentGrade(""); setStudentClassNum(""); }} className="w-full rounded-2xl border border-indigo-500/30 py-3 font-semibold text-indigo-200 hover:bg-white/5 transition-colors">חזרה לתפריט</button>
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
          <button type="button" onClick={() => setView("classes")} className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-700 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:scale-[1.02] transition-all">🏫 ניהול כיתות וקישורים</button>
          <button type="button" onClick={() => setView("stats")} className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:scale-[1.02] transition-all">📊 צפייה בסטטיסטיקה</button>
          <button type="button" onClick={() => setView("questions")} className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:scale-[1.02] transition-all">📝 ניהול שאלות ממתינות</button>
          <button type="button" onClick={() => setView("createTeacher")} className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(167,139,250,0.5)] hover:scale-[1.02] transition-all">🎓 הכנסת מורה</button>
          <button type="button" onClick={() => setView("reports")} className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] hover:scale-[1.02] transition-all">📑 הפקת דוחות</button>
        </div>
      </GlassCard>

      {/* Footer Branding */}
      <div className="absolute bottom-4 text-indigo-500/30 text-xs font-mono tracking-widest pointer-events-none z-20">
        DEEP-SLEEP LABS // MANAGER PORTAL
      </div>
    </SpaceLayout>
  );
}
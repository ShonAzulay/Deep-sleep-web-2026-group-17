import { useState, useEffect, useMemo } from "react";
import { saveSleepEntry, getUserSubmissionCount } from "../services/sleepEntriesService";
import { fetchActiveQuestions } from "../services/classCustomizationService";
import GalacticGame from "./GalacticGame";
import StudentWelcomeScreen from "./StudentWelcomeScreen";

import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

import { STATIC_STEPS } from "../data/staticQuestions";

/**
 * SleepForm Component
 * -------------------
 * The primary data collection wizard for students.
 * Responsibilities:
 * 1. Displaying a multi-step form wizard (Static steps + Dynamic questions).
 * 2. Merging static questions with research-manager defined dynamic questions.
 * 3. Saving daily sleep entries to Firestore via `sleepEntriesService`.
 * 4. Handling validation and UI state for the form progression.
 */
export default function SleepForm({ onLogout }) {
  // "welcome" | "form" | "success" (handled by step logic mostly)

  // "welcome" | "form" | "success" (handled by step logic mostly)
  const [view, setView] = useState("welcome");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({}); // Dynamic answers map
  const [dynamicQuestions, setDynamicQuestions] = useState([]);

  // Merge Static steps with Dynamic questions (except Notes, which should be last)
  const steps = useMemo(() => {
    // We want Notes to be last. Find index of notes.
    const notesIndex = STATIC_STEPS.findIndex(s => s.key === "notes");
    const beforeNotes = STATIC_STEPS.slice(0, notesIndex);
    const notesStep = STATIC_STEPS[notesIndex];

    // Remap dynamic questions to Step format
    const mappedDynamic = dynamicQuestions.map(q => ({
      key: `custom_${q.id}`,
      title: q.text,
      type: q.type || "text",
      options: (q.type === "select" || q.type === "multi")
        ? (q.options || []).map(opt => ({ value: opt, label: opt }))
        : [],
      placeholder: q.type === "text" ? "כתוב את תשובתך כאן..." : undefined,
      isCustom: true
    }));

    return [...beforeNotes, ...mappedDynamic, notesStep];
  }, [dynamicQuestions]);

  const [context, setContext] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    try {
      const userStr = sessionStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        setContext(user);

        // Fetch submission count
        if (user.experimentId && user.classId && user.id) {
          getUserSubmissionCount(user.experimentId, user.classId, user.id)
            .then(count => setSubmissionCount(count));

          // Fetch Dynamic Questions for this class
          fetchActiveQuestions(user.experimentId, user.classId)
            .then(qs => setDynamicQuestions(qs))
            .catch(err => console.error("Failed to fetch questions", err));
        }
      }
    } catch (e) { console.error("Error parsing user context", e); }
  }, []);

  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, success, error
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (step === steps.length && saveStatus === 'idle') {
      if (!context?.experimentId || !context?.classId || !context?.id) {
        console.error("Missing user context");
        setSaveStatus('error');
        setSaveError('Missing User Context');
        return;
      }

      setSaveStatus('saving');
      saveSleepEntry(context.experimentId, context.classId, context.id, answers)
        .then(() => {
          setSaveStatus('success');
          // Re-fetch the true count from DB to handle upserts (prevent double counting)
          getUserSubmissionCount(context.experimentId, context.classId, context.id)
            .then(count => setSubmissionCount(count));
        })
        .catch((err) => {
          console.error("Failed to save sleep entry", err);
          setSaveStatus('error');
          setSaveError(err.message || "Unknown DB Error");
        });
    }
  }, [step, answers, steps.length, context, saveStatus]);

  // If Game is active, show overlay
  if (showGame) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
        <GalacticGame dayCount={submissionCount} onClose={() => setShowGame(false)} />
      </div>
    );
  }

  // Success Screen
  if (step >= steps.length) {
    return (
      <SpaceLayout>
        {/* Success Glass Card */}
        <GlassCard className="w-full max-w-lg text-center" animateFloat={true} glowColor="indigo">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.4)]">
              <span className="text-4xl">✅</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-2">כל הכבוד!</h2>

          {saveStatus === 'saving' && <p className="text-yellow-400 animate-pulse">⏳ שומר נתונים...</p>}
          {saveStatus === 'success' && <p className="text-green-400">היומן היומי נשמר בהצלחה! כל הכבוד!</p>}
          {saveStatus === 'error' && (
            <div className="bg-red-500/20 border border-red-500 p-4 rounded-xl mb-4">
              <p className="text-red-300 font-bold">❌ שגיאה בשמירה:</p>
              <p className="text-red-200 text-sm font-mono">{saveError}</p>
            </div>
          )}

          <p className="text-indigo-300 mb-8">היומן היומי הושלם.</p>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-900/40 border border-indigo-500/30 mb-6">
              <p className="text-sm text-indigo-200 mb-2">התקדמות המשימה שלך</p>
              <div className="flex justify-between items-end mb-1">
                <span className="font-mono font-bold text-cyan-400">DAY {submissionCount} / 14</span>
                <span className="text-xs text-indigo-400">{Math.round((submissionCount / 14) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-indigo-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-cyan-500 shadow-[0_0_10px_#00f3ff]"
                  style={{ width: `${Math.min(100, (submissionCount / 14) * 100)}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setShowGame(true)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-105 transition-transform animate-pulse"
            >
              🚀 שחק במשחק החלל (שלב {submissionCount})
            </button>

            <button
              onClick={() => {
                setStep(0);
                setAnswers({}); // Reset all
              }}
              className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-indigo-200 transition-colors"
            >
              למלא שוב (לצורך בדיקה)
            </button>

            <button onClick={onLogout} className="w-full py-3 text-sm text-indigo-400 hover:text-white transition-colors">
              התנתק וחזור להתחלה
            </button>
          </div>
        </GlassCard>
      </SpaceLayout >
    );
  }

  // ---------------- WELCOME VIEW ----------------
  if (view === "welcome") {
    return (
      <StudentWelcomeScreen
        onStart={() => setView("form")}
        onLogout={onLogout}
        submissionCount={submissionCount}
      />
    );
  }

  // ---------------- FORM VIEW ----------------
  const current = steps[step];
  const progress = Math.round(((step + 1) / steps.length) * 100);

  const canGoNext = current.optional || (
    current.type === "multi" ? (answers[current.key] && answers[current.key].length > 0) : String(answers[current.key] || "").trim() !== ""
  );

  const toggleMultiSelect = (val) => {
    const currentList = answers[current.key] || [];
    const newList = currentList.includes(val) ? currentList.filter(i => i !== val) : [...currentList, val];
    setAnswers({ ...answers, [current.key]: newList });
  };

  // Define Background Elements for SpaceLayout
  const backgroundElements = (
    <>
      {/* 🟢 SVG ANIMATION PAPER LAYER */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* MOON SVG - Top Left */}
        <svg className="absolute top-[10%] left-[10%] w-24 h-24 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-float" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="url(#moonGradient)" />
          <defs>
            <radialGradient id="moonGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(30 30) rotate(51.3402) scale(64.0312)">
              <stop stopColor="#F6F6F6" />
              <stop offset="1" stopColor="#9CA3AF" />
            </radialGradient>
          </defs>
        </svg>

        {/* SHOOTING STARS */}
        <div className="absolute top-[20%] right-[5%] w-[150px] h-[2px] bg-gradient-to-l from-transparent via-white to-transparent opacity-0 animate-[shooting_4s_ease-in-out_infinite] rotate-[45deg]" />
        <div className="absolute top-[50%] left-[10%] w-[100px] h-[2px] bg-gradient-to-l from-transparent via-cyan-200 to-transparent opacity-0 animate-[shooting_6s_ease-in-out_infinite_2s] rotate-[45deg]" />
        <div className="absolute top-[10%] right-[30%] w-[200px] h-[1px] bg-gradient-to-l from-transparent via-indigo-300 to-transparent opacity-0 animate-[shooting_5s_ease-in-out_infinite_1s] rotate-[45deg]" />
      </div>

      {/* 🔵 TOP BAR: 14-DAY PROGRESS */}
      <div className="absolute top-0 left-0 right-0 p-4 z-30 flex justify-center pointer-events-none">
        <div className="glass-panel px-6 py-2 rounded-full flex gap-4 items-center shadow-lg transform scale-90 sm:scale-100">
          <span className="text-xs font-bold text-cyan-300 tracking-wider">MISSION PROGRESS</span>
          <div className="w-32 h-2 bg-indigo-950 rounded-full overflow-hidden border border-indigo-500/30">
            <div
              className="h-full bg-cyan-400 shadow-[0_0_10px_#00f3ff]"
              style={{ width: `${Math.min(100, (submissionCount / 14) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-white">{submissionCount}/14 DAYS</span>
        </div>
      </div>
    </>
  );

  return (
    <SpaceLayout backgroundChildren={backgroundElements}>
      <GlassCard className="w-full max-w-lg mt-12" animateFloat={true} glowColor="indigo">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-mono text-indigo-300">STAGE {step + 1}/{steps.length}</span>
            <span className="text-xs font-mono text-indigo-300">{progress}%</span>
          </div>
          <div className="h-1 w-full bg-indigo-900/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_10px_#00f3ff]"
              style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}
            />
          </div>
        </div>

        {/* Question Title */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center leading-tight drop-shadow-lg scale-100 transition-transform duration-300">
          {current.title}
        </h2>

        {/* Dynamic Input Area */}
        <div className="min-h-[120px] mb-8">

          {/* Choice / Multi Buttons */}
          {(current.type === "select" || current.type === "multi") && (
            <div className="grid grid-cols-1 gap-3">
              {current.options.map((opt) => {
                const isSelected = current.type === "multi"
                  ? (answers[current.key] || []).includes(opt.value)
                  : answers[current.key] === opt.value;

                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (current.type === "multi") toggleMultiSelect(opt.value);
                      else {
                        setAnswers({ ...answers, [current.key]: opt.value });
                        // Auto-advance with slight delay for visual feedback
                        setTimeout(() => setStep(step + 1), 200);
                      }
                    }}
                    className={`
                      relative overflow-hidden rounded-xl py-4 px-6 font-medium text-right transition-all duration-300 border
                      ${isSelected
                        ? "bg-indigo-600/80 border-cyan-400 text-white neon-border shadow-[0_0_15px_rgba(0,243,255,0.4)] translate-x-1"
                        : "bg-white/5 border-white/10 text-indigo-100 hover:bg-white/10 hover:border-indigo-400 hover:scale-[1.02]"
                      }
                    `}
                  >
                    <div className="flex justify-between items-center relative z-10">
                      <span>{opt.label}</span>
                      {current.type === "multi" && (
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-cyan-400 border-cyan-400 text-black' : 'border-indigo-400/50'}`}>
                          {isSelected && <span className="text-xs">✓</span>}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Text Area */}
          {current.type === "text" && (
            <textarea
              placeholder={current.placeholder}
              value={answers[current.key]}
              onChange={(e) => setAnswers({ ...answers, [current.key]: e.target.value })}
              className="w-full h-32 bg-indigo-950/40 text-white placeholder-indigo-400 border border-indigo-500/30 rounded-xl p-4 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none resize-none transition-all"
            />
          )}

        </div>

        {/* Navigation Actions */}
        <div className="flex flex-col gap-3">
          {(current.type === "multi" || current.type === "text") && (
            <button
              onClick={() => canGoNext && setStep(step + 1)}
              disabled={!canGoNext}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:-translate-y-1 transition-all"
            >
              המשך לשלב הבא ➜
            </button>
          )}

          {/* Modified back button logic */}
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm text-indigo-400 hover:text-cyan-300 transition-colors py-2"
            >
              חזרה אחורה
            </button>
          ) : (
            <button
              onClick={() => {
                setStep(0);
                setAnswers({});
                setView("welcome"); // Back to welcome
              }}
              className="text-sm text-indigo-400 hover:text-cyan-300 transition-colors py-2"
            >
              חזרה אחורה
            </button>
          )}
        </div>

      </GlassCard>

      <div className="absolute bottom-4 text-indigo-500/30 text-xs font-mono tracking-widest pointer-events-none z-20 flex flex-col items-center">
        <span>DEEP-SLEEP LABS // V2.0</span>
      </div>

    </SpaceLayout>
  );
}
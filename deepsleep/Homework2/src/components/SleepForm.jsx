import { useState, useEffect } from "react";
import { saveSleepEntry, getUserSubmissionCount } from "../services/sleepEntriesService";
import GalacticGame from "./GalacticGame";

import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

export default function SleepForm({ onLogout }) {
  // ... existing logic ...
  // 1. Updated Questions Format
  const steps = [
    {
      key: "grade",
      title: "אני בכיתה",
      type: "select",
      options: [
        { value: "z", label: "ז" }, { value: "h", label: "ח" }, 
        { value: "t", label: "ט" }, { value: "y", label: "י" }, 
        { value: "ya", label: "י\"א" }, { value: "yb", label: "י\"ב" }
      ],
    },
    {
      key: "gender",
      title: "מגדר",
      type: "select",
      options: [{ value: "male", label: "בן" }, { value: "female", label: "בת" }],
    },
    {
      key: "bed_entry_time",
      title: "נכנסתי למיטה בין השעות",
      type: "select",
      options: [
        { value: "before_21", label: "לפני השעה 21:00" },
        { value: "21_24", label: "בין 21:00- לחצות" },
        { value: "after_24", label: "אחרי חצות" }
      ],
    },
    {
      key: "eye_close_decision",
      title: "הזמן בערך בו החלטתי לעצום עיניים אחרי שנכנסתי למיטה",
      type: "select",
      options: [
        { value: "immediate", label: "מיד כשנכנסתי למיטה לישון" },
        { value: "up_to_1h", label: "עד שעה אחת אחרי שנכנסתי" },
        { value: "2h", label: "שעתיים אחרי שנכנסתי" },
        { value: "3h_plus", label: "כ-3 שעות או יותר" }
      ],
    },
    {
      key: "pre_sleep_activity",
      title: "במה הייתי עסוק/ה לפני שנרדמתי",
      type: "multi",
      options: [
        { value: "phone", label: "טלפון" }, { value: "computer", label: "מחשב" },
        { value: "tablet", label: "טאבלט" }, { value: "book", label: "ספר" },
        { value: "music", label: "מוזיקה" }, { value: "other", label: "אחר" }
      ],
    },
    {
      key: "time_to_fall_asleep",
      title: "הזמן (בדקות) שלקח לי להירדם מהרגע שהחלטתי לעצום עיניים",
      type: "select",
      options: [
        { value: "under_5", label: "פחות מ-5 דקות" },
        { value: "15_or_less", label: "רבע שעה או פחות" },
        { value: "15_30", label: "בין רבע שעה לחצי שעה" },
        { value: "30_60", label: "בין חצי שעה לשעה" },
        { value: "over_60", label: "מעל שעה" }
      ],
    },
    {
      key: "wakeups_count",
      title: "מספר היקיצות שלך בלילה",
      type: "select",
      options: [0, 1, 2, 3, 4, 5, 6, 7, "8 ויותר"].map(v => ({ value: String(v), label: String(v) })),
    },
    {
      key: "awake_duration_total",
      title: "סך כל הדקות שבהן היית ער/ה מהיקיצות בלילה",
      type: "select",
      options: [
        { value: "under_5", label: "פחות מ-5 דקות" },
        { value: "5_15", label: "5 עד 15 דקות" },
        { value: "15_30", label: "15 עד 30 דקות" },
        { value: "30_60", label: "חצי שעה עד שעה" },
        { value: "over_60", label: "מעל שעה" }
      ],
    },
    {
      key: "wake_up_time",
      title: "בבוקר התעוררתי בין השעות",
      type: "select",
      options: [
        { value: "5_6", label: "5-6" }, { value: "6_7", label: "6-7" },
        { value: "7_8", label: "7-8" }, { value: "8_9", label: "8-9" },
        { value: "after_9", label: "אחרי 9 בבוקר" }
      ],
    },
    {
      key: "wake_up_method",
      title: "כיצד התעוררת?",
      type: "select",
      options: [
        { value: "alarm", label: "שעון מעורר" }, { value: "others", label: "העירו אותי" },
        { value: "natural", label: "לבד" }, { value: "noise_light", label: "רעש/אור" }
      ],
    },
    {
      key: "total_sleep_estimate",
      title: "כמה שעות להערתך ישנת אתמול בלילה",
      type: "select",
      options: [
        { value: "under_5", label: "פחות מ-5" }, { value: "5_6", label: "5-6" },
        { value: "6_7", label: "6-7" }, { value: "7_8", label: "7-8" },
        { value: "8_9", label: "8-9" }, { value: "over_9", label: "מעל 9" }
      ],
    },
    {
      key: "notes",
      title: "יש לך הערה שחשוב שנדע?",
      type: "text",
      optional: true,
      placeholder: "זו שאלת בחירה..."
    }
  ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    grade: "", gender: "", bed_entry_time: "", eye_close_decision: "",
    pre_sleep_activity: [], time_to_fall_asleep: "", wakeups_count: "",
    awake_duration_total: "", wake_up_time: "", wake_up_method: "",
    total_sleep_estimate: "", notes: ""
  });

  const [context, setContext] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0); 
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    try {
      const userStr = sessionStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        setContext(user);
        // Fetch submission count for progress bar
        if (user.experimentId && user.classId && user.id) {
            getUserSubmissionCount(user.experimentId, user.classId, user.id)
                .then(count => setSubmissionCount(count));
        }
      }
    } catch (e) { console.error("Error parsing user context", e); }
  }, []);

  useEffect(() => {
    if (step === steps.length) {
      if (!context?.experimentId || !context?.classId || !context?.id) {
        console.error("Missing user context");
        return;
      }
      saveSleepEntry(context.experimentId, context.classId, context.id, answers)
        .then(() => {
            // Update local count immediately to show progress
            setSubmissionCount(prev => prev + 1);
        })
        .catch((err) => console.error("Failed to save sleep entry", err));
    }
  }, [step, answers, steps.length, context]);

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
            <p className="text-indigo-300 mb-8">היומן היומי נשמר בהצלחה.</p>

            <div className="space-y-4">
                 <div className="p-4 rounded-xl bg-indigo-900/40 border border-indigo-500/30 mb-6">
                    <p className="text-sm text-indigo-200 mb-2">התקדמות המשימה שלך</p>
                    <div className="flex justify-between items-end mb-1">
                         <span className="font-mono font-bold text-cyan-400">DAY {submissionCount} / 14</span>
                         <span className="text-xs text-indigo-400">{Math.round((submissionCount/14)*100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-indigo-950 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-green-400 to-cyan-500 shadow-[0_0_10px_#00f3ff]"
                            style={{ width: `${Math.min(100, (submissionCount/14)*100)}%` }}
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
                    setAnswers({
                      grade: "", gender: "", bed_entry_time: "", eye_close_decision: "",
                      pre_sleep_activity: [], time_to_fall_asleep: "", wakeups_count: "",
                      awake_duration_total: "", wake_up_time: "", wake_up_method: "",
                      total_sleep_estimate: "", notes: ""
                    });
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
      </SpaceLayout>
    );
  }

  const current = steps[step];
  const progress = Math.round(((step + 1) / steps.length) * 100);

  const canGoNext = current.optional || (
    current.type === "multi" ? answers[current.key]?.length > 0 : String(answers[current.key] || "").trim() !== ""
  );

  const toggleMultiSelect = (val) => {
    const currentList = answers[current.key];
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
              <stop stopColor="#F6F6F6"/>
              <stop offset="1" stopColor="#9CA3AF"/>
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
                    style={{ width: `${Math.min(100, (submissionCount/14)*100)}%` }} 
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
                  ? answers[current.key].includes(opt.value) 
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
          
          {step > 0 && (
            <button 
              onClick={() => setStep(step - 1)} 
              className="text-sm text-indigo-400 hover:text-cyan-300 transition-colors py-2"
            >
              חזרה אחורה
            </button>
          )}
        </div>

      </GlassCard>
      
      {/* Footer Branding */}
      <div className="absolute bottom-4 text-indigo-500/30 text-xs font-mono tracking-widest pointer-events-none z-20">
        DEEP-SLEEP LABS // V2.0
      </div>

    </SpaceLayout>
  );
}
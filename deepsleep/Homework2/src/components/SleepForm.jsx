import { useState, useEffect } from "react";
import { saveSleepEntry } from "../services/sleepEntriesService";

export default function SleepForm({ onLogout }) {
  const steps = [
    {
      key: "hours",
      title: "כמה שעות ישנת הלילה?",
      type: "number",
      placeholder: "לדוגמה: 7.5",
    },
    {
      key: "quality",
      title: "איך איכות השינה שלך?",
      type: "rating",
    },
    {
      key: "bedtime",
      title: "באיזו שעה הלכת לישון?",
      type: "time",
    },
  ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    hours: "",
    quality: null,
    bedtime: "",
  });

  // שמירת הנתונים בסיום השאלון
  useEffect(() => {
    if (step === steps.length) {
      saveSleepEntry(answers).catch((err) =>
        console.error("Failed to save sleep entry", err)
      );
    }
  }, [step, answers, steps.length]);

  // מסך סיום לאחר מילוי כל השאלות
  if (step >= steps.length) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-xl bg-green-100 p-4 text-green-800">
          <p className="text-lg font-semibold">כל הכבוד! ✅</p>
          <p className="text-sm">היומן היומי נשמר</p>
        </div>

        <button
          onClick={() => {
            setStep(0);
            setAnswers({ hours: "", quality: null, bedtime: "" });
          }}
          className="w-full rounded-2xl border py-3 font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
        >
          למלא שוב
        </button>

        <button
          onClick={onLogout}
          className="w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
        >
          התנתק וחזור להתחלה
        </button>
      </div>
    );
  }

  const current = steps[step];
  const progress = Math.round(((step + 1) / steps.length) * 100);

  const canGoNext =
    current.type === "rating"
      ? answers[current.key] !== null
      : String(answers[current.key]).trim() !== "";

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          <span>
            שאלה {step + 1} מתוך {steps.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Title */}
      <p className="text-center text-lg font-semibold text-slate-800">
        {current.title}
      </p>

      {/* Input Fields based on type */}
      <div className="min-h-[80px] flex items-center justify-center">
        {current.type === "number" && (
          <input
            type="number"
            step="0.5"
            placeholder={current.placeholder}
            value={answers.hours}
            onChange={(e) => setAnswers({ ...answers, hours: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-xl"
          />
        )}

        {current.type === "rating" && (
          <div className="grid grid-cols-5 gap-2 w-full">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => setAnswers({ ...answers, quality: v })}
                className={
                  "rounded-xl py-4 font-bold text-lg transition-all " +
                  (answers.quality === v
                    ? "bg-indigo-600 text-white shadow-lg scale-105"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200")
                }
              >
                {v}
              </button>
            ))}
          </div>
        )}

        {current.type === "time" && (
          <input
            type="time"
            value={answers.bedtime}
            onChange={(e) => setAnswers({ ...answers, bedtime: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-xl"
          />
        )}
      </div>

      {/* Control Buttons */}
      <div className="space-y-3 pt-4">
        <button
          onClick={() => canGoNext && setStep(step + 1)}
          disabled={!canGoNext}
          className="w-full rounded-2xl
                     bg-gradient-to-r from-indigo-600 to-blue-600
                     py-4 font-bold text-white shadow-md
                     disabled:opacity-40 disabled:cursor-not-allowed
                     active:scale-[0.98] transition-all"
        >
          המשך
        </button>

        <button
          onClick={onLogout}
          className="w-full py-2 text-sm font-medium text-slate-400 hover:text-rose-500 transition-colors"
        >
          ביטול והתנתקות
        </button>
      </div>
    </div>
  );
}
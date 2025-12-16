import { useState } from "react";

export default function SleepForm() {
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

  // 🔒 הגנה מלאה – מונע מסך לבן
  if (step >= steps.length) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-xl bg-green-100 p-4 text-green-800">
          <p className="text-lg font-semibold">כל הכבוד! ✅</p>
          <p className="text-sm">היומן היומי נשמר</p>
        </div>

        <button
          onClick={() => setStep(0)}
          className="w-full rounded-2xl border py-3 font-semibold text-slate-800"
        >
          למלא שוב
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
      {/* Progress */}
      <div>
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          <span>
            שאלה {step + 1} מתוך {steps.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-indigo-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <p className="text-center text-lg font-semibold text-slate-800">
        {current.title}
      </p>

      {/* Inputs */}
      {current.type === "number" && (
        <input
          type="number"
          step="0.5"
          placeholder={current.placeholder}
          value={answers.hours}
          onChange={(e) => setAnswers({ ...answers, hours: e.target.value })}
          className="w-full rounded-xl border px-4 py-3"
        />
      )}

      {current.type === "rating" && (
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => setAnswers({ ...answers, quality: v })}
              className={
                "rounded-xl py-3 font-semibold " +
                (answers.quality === v
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700")
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
          className="w-full rounded-xl border px-4 py-3"
        />
      )}

      {/* Button */}
      <button
        onClick={() => canGoNext && setStep(step + 1)}
        disabled={!canGoNext}
        className="w-full rounded-2xl
                   bg-gradient-to-r from-indigo-600 to-blue-600
                   py-3 font-semibold text-white
                   disabled:opacity-40"
      >
        המשך
      </button>
    </div>
  );
}

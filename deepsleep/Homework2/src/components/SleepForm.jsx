import { useState, useEffect } from "react";
import { saveSleepEntry } from "../services/sleepEntriesService";
//test
export default function SleepForm({ onLogout }) {
  const steps = [
    {
      key: "hours",
      title: "כמה שעות ישנת הלילה?",
      type: "select",
      options: [
        { value: "0-4", label: "פחות מ-4 שעות" },
        { value: "4-5", label: "בין 4 ל-5 שעות" },
        { value: "5-6", label: "בין 5 ל-6 שעות" },
        { value: "6-7", label: "בין 6 ל-7 שעות" },
        { value: "7-8", label: "בין 7 ל-8 שעות" },
        { value: "8+", label: "יותר מ-8 שעות" },
      ],
    },
    {
      key: "quality",
      title: "איך איכות השינה שלך?",
      type: "rating",
    },
    {
      key: "bedtime",
      title: "באיזו שעה הלכת לישון?",
      type: "select",
      options: [
        { value: "before_21:00", label: "לפני 21:00" },
        { value: "21:00", label: "21:00" },
        { value: "21:30", label: "21:30" },
        { value: "22:00", label: "22:00" },
        { value: "22:30", label: "22:30" },
        { value: "23:00", label: "23:00" },
        { value: "23:30", label: "23:30" },
        { value: "00:00", label: "00:00" },
        { value: "after_00:00", label: "אחרי 00:00" },
      ],
    },
    {
      key: "bed_entry",
      title: "מתי נכנסת למיטה?",
      type: "select",
      options: [
        { value: "before_2100", label: "לפני 21:00" },
        { value: "2100_to_0000", label: "בין 21:00 ל-00:00" },
        { value: "after_0000", label: "אחרי 00:00" },
      ],
    },
    {
      key: "pre_sleep_activity",
      title: "במה היית עסוק לפני שנרדמת?",
      type: "multi", // בחירה מרובה
      options: [
        { value: "phone", label: "טלפון" },
        { value: "computer", label: "מחשב" },
        { value: "tablet", label: "טאבלט" },
        { value: "book", label: "ספר" },
        { value: "music", label: "מוזיקה" },
        { value: "other", label: "אחר" },
      ],
    },
    {
      key: "eye_close_time",
      title: "הזמן בו החלטת לעצום עיניים אחרי שנכנסת למיטה:",
      type: "select",
      options: [
        { value: "immediate", label: "מיד כשנכנסתי למיטה לישון" },
        { value: "up_to_1h", label: "עד שעה אחת אחרי שנכנסתי" },
        { value: "2h", label: "שעתיים אחרי שנכנסתי" },
        { value: "3h_plus", label: "כ-3 שעות או יותר אחרי שנכנסתי" },
      ],
    },
    {
      key: "time_to_fall_asleep",
      title: "הזמן (בדקות) שלקח לי להירדם מהרגע שעצמתי עיניים:",
      type: "select",
      options: [
        { value: "under_5m", label: "תוך פחות מ-5 דקות" },
        { value: "up_to_15m", label: "בערך רבע שעה או פחות" },
        { value: "15_30m", label: "בין רבע שעה לחצי שעה" },
        { value: "30_60m", label: "בין חצי שעה לשעה" },
        { value: "over_60m", label: "מעל שעה - לקח לי המון זמן" },
      ],
    },
    {
      key: "wakeups_count",
      title: "מספר היקיצות שלך בלילה:",
      type: "select",
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ value: String(n), label: String(n) })),
    },
    {
      key: "awake_duration",
      title: "סך כל הדקות שבהן היית ער/ה מהיקיצות בלילה:",
      type: "select",
      options: [
        { value: "under_5m", label: "פחות מ-5 דקות" },
        { value: "5_15m", label: "מעל 5 דקות ופחות מרבע שעה" },
        { value: "15_30m", label: "מעל רבע שעה ופחות מחצי שעה" },
        { value: "30_60m", label: "מעל חצי שעה ופחות משעה אחת" },
        { value: "over_60m", label: "מעל שעה - היה קשה להירדם שוב" },
      ],
    },
    {
      key: "wake_up_window",
      title: "בבוקר התעוררתי בין השעות:",
      type: "select",
      options: [
        { value: "6_7", label: "6-7" },
        { value: "7_8", label: "7-8" },
        { value: "8_9", label: "8-9" },
        { value: "after_9", label: "אחרי 9 בבוקר" },
      ],
    },
    {
      key: "wake_up_method",
      title: "כיצד התעוררת?",
      type: "select",
      options: [
        { value: "alarm", label: "שעון מעורר" },
        { value: "others", label: "העירו אותי" },
        { value: "natural", label: "התעוררתי לבד" },
        { value: "noise_light", label: "התעוררתי מרעש/אור" },
      ],
    },
    {
      key: "total_sleep_estimate",
      title: "כמה שעות להערתך ישנת אתמול בלילה?",
      type: "select",
      options: [
        { value: "under_5", label: "פחות מ-5 שעות" },
        { value: "5_6", label: "בין 5 ל-6 שעות" },
        { value: "6_7", label: "בין 6 ל-7 שעות" },
        { value: "7_8", label: "בין 7 ל-8 שעות" },
        { value: "8_9", label: "בין 8 ל-9 שעות" },
        { value: "over_9", label: "מעל 9 שעות" },
      ],
    },
    {
      key: "notes",
      title: "יש לך הערה שחשוב שנדע?",
      type: "text", // שאלת טקסט חופשי
      placeholder: "כתבי כאן... (אופציונלי)",
      optional: true,
    },
  ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    hours: "",
    quality: null,
    bedtime: "",
    bed_entry: "",
    pre_sleep_activity: [], // מערך עבור בחירה מרובה
    eye_close_time: "",
    time_to_fall_asleep: "",
    wakeups_count: "",
    awake_duration: "",
    wake_up_window: "",
    wake_up_method: "",
    total_sleep_estimate: "",
    notes: "",
  });

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

  useEffect(() => {
    if (step === steps.length) {
      if (!context?.experimentId || !context?.classId || !context?.id) {
        console.error("Missing user context for saving sleep entry");
        alert("שגיאה: חסר מידע מזהה (Experiment/Class/Student). נסה להתחבר מחדש.");
        return;
      }

      saveSleepEntry(context.experimentId, context.classId, context.id, answers)
        .catch((err) => console.error("Failed to save sleep entry", err));
    }
  }, [step, answers, steps.length, context]);

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
            setAnswers({
              hours: "", quality: null, bedtime: "", bed_entry: "",
              pre_sleep_activity: [], eye_close_time: "", time_to_fall_asleep: "",
              wakeups_count: "", awake_duration: "", wake_up_window: "",
              wake_up_method: "", total_sleep_estimate: "", notes: ""
            });
          }}
          className="w-full rounded-2xl border py-3 font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
        >
          למלא שוב
        </button>
        <button onClick={onLogout} className="w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white hover:opacity-90 transition-opacity">
          התנתק וחזור להתחלה
        </button>
      </div>
    );
  }

  const current = steps[step];
  const progress = Math.round(((step + 1) / steps.length) * 100);

  // לוגיקה לבדיקה אם אפשר להמשיך (בשאלה אופציונלית תמיד אפשר)
  const canGoNext =
    current.optional || (
      current.type === "rating"
        ? answers[current.key] !== null
        : current.type === "multi"
          ? answers[current.key].length > 0
          : String(answers[current.key]).trim() !== ""
    );

  // פונקציה לטיפול בבחירה מרובה
  const toggleMultiSelect = (val) => {
    const currentList = answers[current.key];
    if (currentList.includes(val)) {
      setAnswers({ ...answers, [current.key]: currentList.filter(i => i !== val) });
    } else {
      setAnswers({ ...answers, [current.key]: [...currentList, val] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          <span>שאלה {step + 1} מתוך {steps.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <p className="text-center text-lg font-semibold text-slate-800">{current.title}</p>

      <div className="min-h-[80px] flex items-center justify-center">
        {current.type === "number" && (
          <input type="number" step="0.5" placeholder={current.placeholder} value={answers.hours}
            onChange={(e) => setAnswers({ ...answers, hours: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        )}

        {current.type === "rating" && (
          <div className="grid grid-cols-5 gap-2 w-full">
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} onClick={() => setAnswers({ ...answers, quality: v })}
                className={"rounded-xl py-4 font-bold text-lg transition-all " + (answers.quality === v ? "bg-indigo-600 text-white shadow-lg scale-105" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}>
                {v}
              </button>
            ))}
          </div>
        )}

        {current.type === "time" && (
          <input type="time" value={answers.bedtime} onChange={(e) => setAnswers({ ...answers, bedtime: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        )}

        {(current.type === "select" || current.type === "multi") && (
          <div className="flex flex-col gap-2 w-full">
            {current.options.map((opt) => {
              const isSelected = current.type === "multi"
                ? answers[current.key].includes(opt.value)
                : answers[current.key] === opt.value;

              return (
                <button key={opt.value} onClick={() => current.type === "multi" ? toggleMultiSelect(opt.value) : setAnswers({ ...answers, [current.key]: opt.value })}
                  className={"rounded-xl py-3 px-4 font-medium text-right transition-all border " + (isSelected ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")}>
                  {opt.label}
                  {current.type === "multi" && isSelected && " ✓"}
                </button>
              );
            })}
          </div>
        )}

        {current.type === "text" && (
          <textarea
            placeholder={current.placeholder}
            value={answers[current.key]}
            onChange={(e) => setAnswers({ ...answers, [current.key]: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        )}
      </div>

      <div className="space-y-3 pt-4">
        <button onClick={() => canGoNext && setStep(step + 1)} disabled={!canGoNext}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-4 font-bold text-white shadow-md disabled:opacity-40 active:scale-[0.98] transition-all">
          {step === steps.length - 1 ? "סיום ושמירה" : "המשך"}
        </button>
        <button onClick={onLogout} className="w-full py-2 text-sm font-medium text-slate-400 hover:text-rose-500 transition-colors">
          ביטול והתנתקות
        </button>
      </div>
    </div>
  );
}
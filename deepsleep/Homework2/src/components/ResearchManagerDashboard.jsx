// src/pages/ResearchManagerDashboard.jsx
export default function ResearchManagerDashboard({ onLogout }) {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-slate-900 px-4"
    >
      <div className="w-full max-w-3xl rounded-3xl bg-white/95 p-6 sm:p-10 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">דשבורד מנהל מחקר</h1>
            <p className="mt-2 text-slate-600">
              כרגע זה מסך בלבד (UI). אין עדיין לוגיקה מאחורי הפעולות.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white"
          >
            התנתק
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-bold text-slate-900">סטטיסטיקה של טפסים</h2>
            <p className="mt-2 text-sm text-slate-600">
              כאן יוצגו גרפים/מספרים (placeholder).
            </p>

            <div className="mt-4 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
              • סה״כ טפסים: — <br />
              • ממוצע שעות שינה: — <br />
              • ממוצע איכות: — <br />
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-2xl bg-indigo-600 py-3 font-semibold text-white"
            >
              צפייה בסטטיסטיקות
            </button>
          </div>

          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-bold text-slate-900">יצירת תלמיד חדש</h2>
            <p className="mt-2 text-sm text-slate-600">
              בהמשך זה יפתח טופס יצירה (placeholder).
            </p>

            <div className="mt-4 space-y-3">
              <input
                disabled
                placeholder="שם משתמש לתלמיד (placeholder)"
                className="w-full rounded-xl border px-4 py-3 disabled:bg-slate-50"
              />
              <input
                disabled
                placeholder="סיסמה זמנית (placeholder)"
                className="w-full rounded-xl border px-4 py-3 disabled:bg-slate-50"
              />
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-2xl bg-emerald-600 py-3 font-semibold text-white"
            >
              יצירת תלמיד
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

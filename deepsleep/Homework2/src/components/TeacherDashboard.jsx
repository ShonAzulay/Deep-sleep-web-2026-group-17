export default function TeacherDashboard({ onLogout }) {
  return (
    <div dir="rtl" className="min-h-screen grid place-items-center bg-slate-900 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/95 p-6 shadow-2xl">
        <h1 className="text-2xl font-bold text-slate-900">דשבורד מורה</h1>
        <p className="mt-2 text-slate-600">עוד לא נבנה — placeholder.</p>

        <button
          onClick={onLogout}
          className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white"
        >
          התנתק
        </button>
      </div>
    </div>
  );
}

export default function RoleSelect({ onSelect }) {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center
                 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
                 px-4"
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white/95
                   p-6 sm:p-10 shadow-2xl backdrop-blur"
      >
        <h1 className="mb-8 text-center text-3xl font-extrabold text-slate-900">
          בחר תפקיד להתחברות
        </h1>

        <div className="space-y-5">
          <button
            onClick={() => onSelect("student")}
            className="w-full rounded-2xl bg-indigo-600 py-6
                       text-xl font-bold text-white hover:opacity-95"
          >
            כניסת תלמיד
          </button>

          <button
            onClick={() => onSelect("teacher")}
            className="w-full rounded-2xl bg-green-600 py-6
                       text-xl font-bold text-white hover:opacity-95"
          >
            כניסת מורה
          </button>

          <button
            onClick={() => onSelect("researchManager")}
            className="w-full rounded-2xl bg-purple-600 py-6
                       text-xl font-bold text-white hover:opacity-95"
          >
            כניסת מנהל מחקר
          </button>
        </div>
      </div>
    </div>
  );
}

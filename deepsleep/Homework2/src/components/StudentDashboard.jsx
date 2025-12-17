
import SleepForm from "./SleepForm";

export default function StudentDashboard() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center
                 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
                 px-4"
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white/95
                   p-6 sm:p-8 shadow-2xl backdrop-blur"
      >
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
          Deep Sleep 🌙
        </h1>

        <p className="mb-6 text-center text-sm text-slate-500">
          מילוי יומי – פחות מדקה
        </p>

        <SleepForm />
      </div>
    </div>
  );
}

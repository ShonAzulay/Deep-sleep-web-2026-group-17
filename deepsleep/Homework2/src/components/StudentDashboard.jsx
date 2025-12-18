// src/components/StudentDashboard.jsx
import SleepForm from "./SleepForm";

export default function StudentDashboard({ onLogout }) { // מקבל את onLogout כ-Prop
  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center
                 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
                 px-4"
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white/95
                   p-6 sm:p-8 shadow-2xl backdrop-blur relative"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Deep Sleep 🌙
          </h1>
          
          {/* כפתור התנתקות שמחזיר למסך בחירת תפקיד */}
          <button 
            onClick={onLogout}
            className="text-sm font-bold text-rose-600 hover:text-rose-800 transition-colors"
          >
            התנתק
          </button>
        </div>

        <p className="mb-6 text-center text-sm text-slate-500">
          מילוי יומי – פחות מדקה
        </p>

        {/* מעבירים את onLogout גם לתוך הטופס אם תרצה כפתור גם שם */}
        <SleepForm onLogout={onLogout} />
      </div>
    </div>
  );
}
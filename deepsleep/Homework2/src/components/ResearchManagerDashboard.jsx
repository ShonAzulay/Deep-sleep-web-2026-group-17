import { useState } from "react";
import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

// Sub-components
import ResearchStatsView from "./ResearchStatsView";
import ResearchReportsView from "./ResearchReportsView";
import ResearchClassesView from "./ResearchClassesView";
import ResearchQuestionsView from "./ResearchQuestionsView";
import ResearchTeacherView from "./ResearchTeacherView";

export default function ResearchManagerDashboard({ onLogout }) {
  const [view, setView] = useState("menu");
  const [experimentId, setExperimentId] = useState("Exp1");

  // --- Router Logic ---
  if (view === "reports") {
    return <ResearchReportsView onBack={() => setView("menu")} />;
  }

  if (view === "stats") {
    return <ResearchStatsView onBack={() => setView("menu")} />;
  }

  if (view === "classes") {
    return <ResearchClassesView experimentId={experimentId} setExperimentId={setExperimentId} onBack={() => setView("menu")} />;
  }

  if (view === "questions") {
    return <ResearchQuestionsView onBack={() => setView("menu")} />;
  }

  if (view === "createTeacher") {
    return <ResearchTeacherView experimentId={experimentId} setExperimentId={setExperimentId} onBack={() => setView("menu")} />;
  }

  // Note: "deleteStudent" button was removed from menu in previous steps, but if needed logic is now in ResearchDeleteStudentView
  // If you ever need to restore the "Mange Students" view, import ResearchDeleteStudentView

  // --- Main Menu ---
  return (
    <SpaceLayout>
      <GlassCard className="w-full max-w-2xl" glowColor="indigo">
        <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
          <div><h1 className="text-3xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">דשבורד מנהל מחקר</h1></div>
          <button onClick={onLogout} className="rounded-xl border border-indigo-500/50 px-4 py-2 font-semibold text-indigo-300 hover:text-white hover:bg-white/5 transition-colors">התנתק</button>
        </div>

        {/* Context Display in Menu */}
        <div className="mt-6 bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/30 relative z-10 backdrop-blur-sm">
          <p className="text-center font-bold text-indigo-200 mb-2">עובד על:</p>
          <div className="flex gap-4 justify-center">
            <div className="text-center">
              <span className="text-xs text-indigo-400 uppercase tracking-wider">Experiment</span>
              <div className="font-mono font-bold text-cyan-400 bg-indigo-900/50 px-3 py-1 rounded border border-indigo-500/30 shadow-[0_0_10px_rgba(0,243,255,0.2)]">{experimentId}</div>
            </div>
          </div>
          <p className="text-center text-xs text-indigo-500 mt-2">(ניתן לשנות במסכים הפנימיים)</p>
        </div>

        <div className="mt-8 space-y-5 relative z-10">
          <button type="button" onClick={() => setView("classes")} className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-700 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:scale-[1.02] transition-all">🏫 ניהול כיתות וקישורים</button>
          <button type="button" onClick={() => setView("stats")} className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:scale-[1.02] transition-all">📊 צפייה בסטטיסטיקה</button>
          <button type="button" onClick={() => setView("questions")} className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:scale-[1.02] transition-all">📝 ניהול שאלות ממתינות</button>
          <button type="button" onClick={() => setView("createTeacher")} className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(167,139,250,0.5)] hover:scale-[1.02] transition-all">🎓 הכנסת מורה</button>
          <button type="button" onClick={() => setView("reports")} className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-6 text-xl font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] hover:scale-[1.02] transition-all">📑 הפקת דוחות</button>
        </div>
      </GlassCard>

      {/* Footer Branding */}
      <div className="absolute bottom-4 text-indigo-500/30 text-xs font-mono tracking-widest pointer-events-none z-20">
        DEEP-SLEEP LABS // MANAGER PORTAL
      </div>
    </SpaceLayout>
  );
}
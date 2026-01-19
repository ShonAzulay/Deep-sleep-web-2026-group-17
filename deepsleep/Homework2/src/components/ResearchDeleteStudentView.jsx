import { useState } from "react";
import { researchManagerDeleteStudent } from "../services/researchManagerStudentUpload";
import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';
import ResearchDashboardHeader from "./ResearchDashboardHeader";

export default function ResearchDeleteStudentView({ experimentId, onBack }) {
    const [studentUsername, setStudentUsername] = useState("");
    const [studentSchoolName, setStudentSchoolName] = useState("");
    const [studentGrade, setStudentGrade] = useState("");
    const [studentClassNum, setStudentClassNum] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const canSubmitDelete = studentUsername.trim() !== "" && !loading;

    async function handleDeleteStudent() {
        if (!window.confirm(`האם אתה בטוח שברצונך למחוק את ${studentUsername}?`)) return;
        setError(""); setMessage(""); setLoading(true);
        try {
            const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\u0590-\u05FF]/g, '');
            const derivedClassId = `${sanitize(studentSchoolName)}_${sanitize(studentGrade)}_${sanitize(studentClassNum)}`;

            await researchManagerDeleteStudent(experimentId, derivedClassId, studentUsername);
            setMessage(`התלמיד ${studentUsername} נמחק בהצלחה`);
            setStudentUsername("");
        } catch (e) { setError("למחיקה, וודא שכל פרטי הכיתה והשם משתמש מלאים ונכונים."); } finally { setLoading(false); }
    }

    return (
        <SpaceLayout>
            <GlassCard className="w-full max-w-md" animateFloat={true} glowColor="indigo">
                <ResearchDashboardHeader title="מחיקת תלמיד" error={error} message={message} />

                <p className="mb-6 text-center text-sm text-indigo-300">הזן שם משתמש לזיהוי.</p>
                <div className="space-y-4">
                    <input type="text" placeholder="שם משתמש (User ID)" value={studentUsername} onChange={(e) => setStudentUsername(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />

                    <div className="bg-indigo-900/20 p-3 rounded-xl border border-indigo-500/20 space-y-2">
                        <p className="text-xs text-indigo-400 font-bold uppercase mb-1">שיוך לכיתה (חובה למלא במדויק למחיקה)</p>
                        <input type="text" placeholder="שם בית הספר" value={studentSchoolName} onChange={(e) => setStudentSchoolName(e.target.value)} className="w-full rounded-lg bg-indigo-950/50 border border-indigo-500/30 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-400 outline-none" />
                        <div className="flex gap-2">
                            <input type="text" placeholder="שכבה" value={studentGrade} onChange={(e) => setStudentGrade(e.target.value)} className="flex-1 rounded-lg bg-indigo-950/50 border border-indigo-500/30 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-400 outline-none" />
                            <input type="text" placeholder="מס' כיתה" value={studentClassNum} onChange={(e) => setStudentClassNum(e.target.value)} className="flex-1 rounded-lg bg-indigo-950/50 border border-indigo-500/30 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-cyan-400 outline-none" />
                        </div>
                    </div>

                    <button disabled={!canSubmitDelete} onClick={handleDeleteStudent} className={`w-full rounded-2xl py-3 font-semibold text-white disabled:opacity-40 shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-r from-rose-600 to-red-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]`}>{loading ? "מבצע..." : "מחק תלמיד"}</button>

                    <button onClick={onBack} className="w-full rounded-2xl border border-indigo-500/30 py-3 font-semibold text-indigo-200 hover:bg-white/5 transition-colors">חזרה לתפריט</button>
                </div>
            </GlassCard>
        </SpaceLayout>
    );
}

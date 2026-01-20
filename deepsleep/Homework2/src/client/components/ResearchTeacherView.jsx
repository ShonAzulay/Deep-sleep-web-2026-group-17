import { useState } from "react";
import { researchManagerCreateTeacher } from "../../server/services/teacherManagementService";
import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';
import ResearchDashboardHeader from "./ResearchDashboardHeader";

export default function ResearchTeacherView({ experimentId, setExperimentId, onBack }) {
    const [teacherName, setTeacherName] = useState("");
    const [teacherEmail, setTeacherEmail] = useState("");
    const [teacherPassword, setTeacherPassword] = useState("");
    const [schoolName, setSchoolName] = useState("");
    const [gradeLevel, setGradeLevel] = useState("");
    const [classNumber, setClassNumber] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const canSubmitCreateTeacher = teacherName.trim() && teacherEmail.trim() && teacherPassword.trim() && schoolName.trim() && gradeLevel.trim() && classNumber.trim() && !loading;

    async function handleCreateTeacher() {
        setError(""); setMessage(""); setLoading(true);
        try {
            const result = await researchManagerCreateTeacher({
                experimentId,
                teacherName,
                email: teacherEmail,
                password: teacherPassword,
                schoolName,
                grade: gradeLevel,
                classNum: classNumber
            });
            setMessage(`מורה נוצר בהצלחה!\n(ClassID: ${result.classId})`);
            setTeacherName(""); setTeacherEmail(""); setTeacherPassword(""); setSchoolName(""); setGradeLevel(""); setClassNumber("");
        } catch (e) { setError(e?.message || "שגיאה ביצירת מורה"); } finally { setLoading(false); }
    }

    return (
        <SpaceLayout>
            <GlassCard className="w-full max-w-md" animateFloat={true} glowColor="indigo">
                <ResearchDashboardHeader
                    title="הכנסת מורה חדש"
                    experimentId={experimentId}
                    setExperimentId={setExperimentId}
                    error={error}
                    message={message}
                />

                <p className="mb-6 text-center text-sm text-indigo-300">הזן את פרטי המורה והכיתה.</p>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-xs text-indigo-400 font-bold uppercase">פרטי מורה</label>
                        <input type="text" placeholder="שם מלא" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
                        <input type="email" placeholder="אימייל (שם משתמש)" value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
                        <input type="password" placeholder="סיסמה ראשונית" value={teacherPassword} onChange={(e) => setTeacherPassword(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
                    </div>

                    <div className="h-px bg-indigo-500/30 my-2" />

                    <div className="space-y-2">
                        <label className="text-xs text-indigo-400 font-bold uppercase">שיוך כיתתי (היררכיה)</label>
                        <input type="text" placeholder="שם בית הספר" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
                        <input type="text" placeholder="שכבה (לדוגמה: יא)" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
                        <input type="text" placeholder="מספר כיתה (לדוגמה: 3)" value={classNumber} onChange={(e) => setClassNumber(e.target.value)} className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-cyan-400 outline-none" />
                    </div>

                    <button disabled={!canSubmitCreateTeacher} onClick={handleCreateTeacher} className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 mt-4 py-3 font-semibold text-white disabled:opacity-40 shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all hover:scale-[1.02]">
                        {loading ? "מבצע..." : "צור מורה ושייך לכיתה"}
                    </button>

                    <button onClick={onBack} className="w-full rounded-2xl border border-indigo-500/30 py-3 font-semibold text-indigo-200 hover:bg-white/5 transition-colors">חזרה לתפריט</button>
                </div>
            </GlassCard>
        </SpaceLayout>
    );
}

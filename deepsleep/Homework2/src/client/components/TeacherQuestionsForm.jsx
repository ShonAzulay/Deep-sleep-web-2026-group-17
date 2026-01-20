import { useState } from "react";
import { submitQuestionRequest } from "../../server/services/classCustomizationService";
import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

export default function TeacherQuestionsForm({ onBack, context }) {
    const INITIAL_QUESTIONS = [
        { text: "", type: "text", options: "" },
        { text: "", type: "text", options: "" },
        { text: "", type: "text", options: "" },
        { text: "", type: "text", options: "" },
        { text: "", type: "text", options: "" }
    ];

    const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // פונקציה לשמירת שאלות
    async function handleSaveQuestions() {
        if (!context?.experimentId || !context?.classId) {
            alert("חסר מידע על הניסוי/כיתה. אנא התחבר מחדש.");
            return;
        }

        const filledQuestions = questions.filter(q => q.text.trim() !== "");
        if (filledQuestions.length === 0) return;

        setLoading(true);
        setMessage("");

        try {
            // Shorthand: Send all non-empty questions
            // We could use Promise.all to send parallel
            const promises = filledQuestions.map(q => {
                // Parse options if needed
                const finalOptions = q.type === 'select'
                    ? q.options.split(',').map(s => s.trim()).filter(Boolean)
                    : [];

                return submitQuestionRequest(context.experimentId, context.classId, {
                    text: q.text,
                    type: q.type,
                    options: finalOptions
                });
            });

            await Promise.all(promises);

            setMessage(`${filledQuestions.length} שאלות נשלחו בהצלחה וממתינות לאישור.`);
            setQuestions(INITIAL_QUESTIONS); // Reset
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SpaceLayout>
            <GlassCard className="w-full max-w-md" animateFloat={true} glowColor="emerald">
                <h1 className="text-2xl font-bold text-center text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">הצעת שאלה חדשה</h1>

                <p className="text-center text-indigo-200 mb-6 text-sm">
                    הכנס את השאלה שברצונך להוסיף. ניתן לבחור שאלה פתוחה או אמריקאית.
                </p>

                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <div key={idx} className="relative p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
                            <span className="absolute -top-2 right-3 bg-indigo-900 text-xs text-indigo-300 px-2 rounded-full border border-indigo-500/30">
                                שאלה {idx + 1}
                            </span>

                            {/* Question Text */}
                            <input
                                type="text"
                                placeholder={`הכנס את תוכן שאלה ${idx + 1}...`}
                                value={q.text}
                                onChange={(e) => {
                                    const newQs = [...questions];
                                    newQs[idx] = { ...newQs[idx], text: e.target.value };
                                    setQuestions(newQs);
                                }}
                                className="w-full rounded-xl bg-indigo-950/50 border border-indigo-500/50 px-4 py-3 text-white placeholder-indigo-400 focus:ring-2 focus:ring-emerald-400 outline-none mt-2 mb-2"
                            />

                            {/* Type Selector */}
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => {
                                        const newQs = [...questions];
                                        newQs[idx] = { ...newQs[idx], type: 'text' };
                                        setQuestions(newQs);
                                    }}
                                    className={`flex-1 py-1 text-xs rounded-lg transition-colors border ${q.type === 'text' ? 'bg-emerald-600/50 border-emerald-400 text-white' : 'bg-transparent border-indigo-500/30 text-indigo-400'}`}
                                >
                                    טקסט פתוח
                                </button>
                                <button
                                    onClick={() => {
                                        const newQs = [...questions];
                                        newQs[idx] = { ...newQs[idx], type: 'select' };
                                        setQuestions(newQs);
                                    }}
                                    className={`flex-1 py-1 text-xs rounded-lg transition-colors border ${q.type === 'select' ? 'bg-emerald-600/50 border-emerald-400 text-white' : 'bg-transparent border-indigo-500/30 text-indigo-400'}`}
                                >
                                    שאלה אמריקאית
                                </button>
                            </div>

                            {/* Options Input (if select) */}
                            {q.type === 'select' && (
                                <input
                                    type="text"
                                    placeholder="אפשרויות תשובה (מופרד בפסיקים)..."
                                    value={q.options}
                                    onChange={(e) => {
                                        const newQs = [...questions];
                                        newQs[idx] = { ...newQs[idx], options: e.target.value };
                                        setQuestions(newQs);
                                    }}
                                    className="w-full text-xs rounded-lg bg-indigo-900/30 border border-indigo-500/30 px-3 py-2 text-emerald-100 placeholder-emerald-500/50 focus:ring-1 focus:ring-emerald-400 outline-none"
                                />
                            )}
                        </div>
                    ))}

                    <button
                        onClick={handleSaveQuestions}
                        disabled={loading || questions.every(q => !q.text.trim())}
                        className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-bold text-white disabled:opacity-50 mt-4 transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]"
                    >
                        {loading ? "שולח..." : "שלח שאלות לאישור"}
                    </button>

                    {message && (
                        <p className="text-center text-emerald-400 text-sm font-medium mt-2 bg-emerald-900/20 py-2 rounded-lg border border-emerald-500/30 animate-pulse">
                            {message}
                        </p>
                    )}

                    <button
                        onClick={onBack}
                        className="w-full rounded-2xl border border-indigo-500/30 py-3 font-semibold text-indigo-200 transition-all hover:bg-white/5"
                    >
                        חזרה לתפריט
                    </button>
                </div>
            </GlassCard>
        </SpaceLayout>
    );
}

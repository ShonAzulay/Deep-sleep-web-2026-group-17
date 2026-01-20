import { useState, useEffect } from "react";
import {
    fetchPendingQuestions,
    approveQuestions
} from "../../server/services/classCustomizationService";
import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';
import ResearchDashboardHeader from "./ResearchDashboardHeader";

export default function ResearchQuestionsView({ onBack }) {
    const CATEGORIES = [
        { id: "focus", label: "ריכוז" },
        { id: "nutrition", label: "תזונה" },
        { id: "mental", label: "חוויה נפשית" },
        { id: "environment", label: "הפרעות סביבתיות" },
        { id: "exercise", label: "פעילות גופנית" },
        { id: "general", label: "כללי/אחר" }
    ];

    const [pendingQuestions, setPendingQuestions] = useState([]);
    const [loadingQ, setLoadingQ] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // To handle edits, we will store a map of { id: editedText }
    const [editedTexts, setEditedTexts] = useState({});
    // To handle categories, we will store a map of { id: categoryId }
    const [questionCategories, setQuestionCategories] = useState({});
    // To handle types and options
    const [questionTypes, setQuestionTypes] = useState({}); // { id: 'text' | 'select' }
    const [questionOptions, setQuestionOptions] = useState({}); // { id: "opt1, opt2" }
    // Selected questions to approve (ids)
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        loadQuestions();
    }, []);

    async function loadQuestions() {
        setLoadingQ(true);
        setError("");
        setMessage("");
        setPendingQuestions([]);
        setEditedTexts({});
        setQuestionCategories({});
        setQuestionTypes({});
        setQuestionOptions({});
        setSelectedIds([]);
        try {
            const data = await fetchPendingQuestions();
            setPendingQuestions(data);
            // Initialize edited texts with original texts and types
            const initialEdits = {};
            const initialTypes = {};
            const initialOptions = {};

            data.forEach(q => {
                initialEdits[q.id] = q.text;
                initialTypes[q.id] = q.type || 'text';
                if (q.options && Array.isArray(q.options)) {
                    initialOptions[q.id] = q.options.join(', ');
                }
            });

            setEditedTexts(initialEdits);
            setQuestionTypes(initialTypes);
            setQuestionOptions(initialOptions);
        } catch (err) {
            console.error(err);
            setError("שגיאה בטעינת שאלות");
        } finally {
            setLoadingQ(false);
        }
    }

    const toggleSelectQuestion = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(x => x !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    async function handleApproveSelected() {
        if (selectedIds.length === 0) return;
        setLoadingQ(true);
        try {
            const questionsToApprove = selectedIds.map(id => {
                const originalQ = pendingQuestions.find(q => q.id === id);
                const type = questionTypes[id] || "text";
                const optionsRaw = questionOptions[id] || "";
                const options = type === "select" ? optionsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

                return {
                    originalId: id,
                    finalText: editedTexts[id],
                    category: questionCategories[id] || "general",
                    type: type,
                    options: options,
                    classId: originalQ?.classId,
                    experimentId: originalQ?.experimentId
                };
            });

            await approveQuestions(questionsToApprove);

            setMessage(`${selectedIds.length} שאלות אושרו בהצלחה!`);
            loadQuestions();
        } catch (e) {
            setError("שגיאה באישור השאלות");
            console.error(e);
        } finally {
            setLoadingQ(false);
        }
    }

    return (
        <SpaceLayout>
            <GlassCard className="w-full max-w-2xl" animateFloat={true} glowColor="indigo">
                <ResearchDashboardHeader
                    title="ניהול בקשות לשאלות כיתתיות"
                    error={error}
                    message={message}
                />

                <div className="mb-6">
                    <p className="text-indigo-200 text-sm mb-4">
                        סמן V ליד השאלות לאישור, ערוך את הטקסט במידת הצורך, ולחץ על "אשר מסומנים".
                    </p>
                    {loadingQ && pendingQuestions.length === 0 ? <p className="text-white">טוען...</p> : (
                        <div className="space-y-4 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                            {pendingQuestions.length === 0 && <p className="text-center text-indigo-400/70 py-4">אין בקשות ממתינות</p>}

                            {pendingQuestions.map(q => (
                                <div key={q.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${selectedIds.includes(q.id) ? 'bg-indigo-600/30 border-cyan-400' : 'bg-indigo-950/30 border-indigo-500/20'}`}>
                                    <input
                                        type="checkbox"
                                        className="mt-2 h-5 w-5 accent-cyan-400"
                                        checked={selectedIds.includes(q.id)}
                                        onChange={() => toggleSelectQuestion(q.id)}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-xs text-indigo-400">נשלח: {q?.createdAt?.toDate?.()?.toLocaleString()}</p>
                                            <span className="text-[10px] font-mono bg-indigo-800/80 text-cyan-300 px-2 py-0.5 rounded border border-indigo-600">
                                                {q.classId}
                                            </span>
                                        </div>
                                        <textarea
                                            className="w-full bg-indigo-950/60 border border-indigo-500/30 rounded-lg p-2 text-white font-medium focus:ring-2 focus:ring-cyan-400 outline-none resize-none mb-2"
                                            value={editedTexts[q.id] || ""}
                                            onChange={(e) => setEditedTexts({ ...editedTexts, [q.id]: e.target.value })}
                                            rows={2}
                                        />
                                        <select
                                            className="w-full bg-indigo-950/60 border border-indigo-500/30 rounded-lg p-2 text-xs text-indigo-200 outline-none focus:ring-2 focus:ring-cyan-400"
                                            value={questionCategories[q.id] || ""}
                                            onChange={(e) => setQuestionCategories({ ...questionCategories, [q.id]: e.target.value })}
                                        >
                                            <option value="" disabled>-- בחר קטגוריה --</option>
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                        </select>

                                        <div className="flex gap-2 mt-2">
                                            <select
                                                className="w-1/3 bg-indigo-950/60 border border-indigo-500/30 rounded-lg p-2 text-xs text-indigo-200 outline-none focus:ring-2 focus:ring-cyan-400"
                                                value={questionTypes[q.id] || "text"}
                                                onChange={(e) => setQuestionTypes({ ...questionTypes, [q.id]: e.target.value })}
                                            >
                                                <option value="text">טקסט פתוח</option>
                                                <option value="select">בחירה (Select)</option>
                                            </select>

                                            {(questionTypes[q.id] === "select") && (
                                                <input
                                                    type="text"
                                                    placeholder="אפשרויות (מופרד בפסיק)"
                                                    className="flex-1 bg-indigo-950/60 border border-indigo-500/30 rounded-lg p-2 text-xs text-white placeholder-indigo-400/50 outline-none focus:ring-2 focus:ring-cyan-400"
                                                    value={questionOptions[q.id] || ""}
                                                    onChange={(e) => setQuestionOptions({ ...questionOptions, [q.id]: e.target.value })}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleApproveSelected}
                    disabled={loadingQ || selectedIds.length === 0}
                    className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 py-3 font-bold text-white mb-3 disabled:opacity-50 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] transition-all"
                >
                    {loadingQ ? "מעבד..." : `אשר ${selectedIds.length} שאלות מסומנות`}
                </button>

                <button onClick={onBack} className="w-full rounded-2xl border border-indigo-500/30 py-3 font-semibold text-indigo-200 hover:bg-white/5 transition-colors">
                    חזרה לתפריט
                </button>
            </GlassCard>
        </SpaceLayout>
    );
}

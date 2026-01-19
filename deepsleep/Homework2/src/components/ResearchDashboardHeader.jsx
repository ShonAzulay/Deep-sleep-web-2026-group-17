import { useState } from "react";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ResearchDashboardHeader({ title, experimentId, setExperimentId, error, message }) {
    const [experimentsList, setExperimentsList] = useState([]);
    const [showExpList, setShowExpList] = useState(false);

    async function fetchExperiments() {
        try {
            const colRef = collection(db, "experiments");
            const snap = await getDocs(colRef);
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setExperimentsList(list);
        } catch (err) {
            console.error("Error fetching experiments:", err);
        }
    }

    return (
        <div className="mb-8 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{title}</h1>

            {experimentId !== undefined && setExperimentId && (
                <div className="glass-panel p-4 rounded-xl mb-4 text-sm flex gap-3 flex-wrap border border-indigo-500/30">
                    <div className="flex flex-col flex-1 min-w-[200px] relative">
                        <label className="font-bold text-indigo-300 mb-1">Experiment ID (ליצירת משתמשים)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={experimentId}
                                onChange={e => setExperimentId(e.target.value)}
                                className="flex-1 bg-indigo-950/50 border border-indigo-500/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
                            />
                            <button
                                onClick={() => {
                                    if (!showExpList) fetchExperiments();
                                    setShowExpList(!showExpList);
                                }}
                                className="bg-indigo-800/80 hover:bg-indigo-700 text-cyan-300 px-3 py-2 rounded-lg border border-indigo-500/50 transition-colors"
                                title="בחר מתוך רשימה"
                            >
                                📂
                            </button>
                        </div>

                        {/* Experiment List Dropdown */}
                        {showExpList && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-cyan-500/30 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-md">
                                <div className="p-2 border-b border-white/10 flex justify-between items-center">
                                    <span className="text-xs text-indigo-300 font-bold">בחר ניסוי:</span>
                                    <button onClick={() => setShowExpList(false)} className="text-xs text-red-400 hover:text-red-300">סגור</button>
                                </div>
                                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                                    {experimentsList.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-xs">לא נמצאו ניסויים</div>
                                    ) : (
                                        experimentsList.map(exp => (
                                            <button
                                                key={exp.id}
                                                onClick={() => {
                                                    setExperimentId(exp.id);
                                                    setShowExpList(false);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm text-indigo-100 hover:bg-cyan-900/30 hover:text-cyan-300 transition-colors border-b border-white/5 last:border-0"
                                            >
                                                {exp.id}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(error || message) && (
                <div className="text-center mb-4">
                    {error && <p className="text-red-400 font-bold bg-red-900/20 py-2 rounded-lg border border-red-500/30">{error}</p>}
                    {message && <p className="text-emerald-400 font-bold bg-emerald-900/20 py-2 rounded-lg border border-emerald-500/30">{message}</p>}
                </div>
            )}
        </div>
    );
}

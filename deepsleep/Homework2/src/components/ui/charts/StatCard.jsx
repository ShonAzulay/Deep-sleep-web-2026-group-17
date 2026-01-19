import { t } from "../../../utils/translations";

// Map colors to static Tailwind classes so the compiler detects them
const COLOR_VARIANTS = {
    cyan: "from-cyan-500 to-cyan-400 shadow-cyan-500/50",
    blue: "from-blue-500 to-blue-400 shadow-blue-500/50",
    indigo: "from-indigo-500 to-indigo-400 shadow-indigo-500/50",
    violet: "from-violet-500 to-violet-400 shadow-violet-500/50",
    fuchsia: "from-fuchsia-500 to-fuchsia-400 shadow-fuchsia-500/50",
    pink: "from-pink-500 to-pink-400 shadow-pink-500/50",
    rose: "from-rose-500 to-rose-400 shadow-rose-500/50",
    orange: "from-orange-500 to-orange-400 shadow-orange-500/50",
    yellow: "from-yellow-500 to-yellow-400 shadow-yellow-500/50",
    emerald: "from-emerald-500 to-emerald-400 shadow-emerald-500/50",
    teal: "from-teal-500 to-teal-400 shadow-teal-500/50",
};

export default function StatCard({ title, data, color = "indigo" }) {
    if (!data || Object.keys(data).length === 0) return null;

    const total = Object.values(data).reduce((a, b) => a + b, 0);
    const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]); // Sort by count desc

    // Fallback to indigo if color not found
    const colorClasses = COLOR_VARIANTS[color] || COLOR_VARIANTS.indigo;

    return (
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 shadow-lg mb-4 hover:border-indigo-400/50 transition-colors h-full">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2 flex justify-between items-center">
                {title}
                <span className="text-xs font-normal text-indigo-300 bg-indigo-900/50 px-2 py-1 rounded-full">{total} reps</span>
            </h3>
            <div className="space-y-3">
                {sortedEntries.map(([label, count]) => {
                    const percent = Math.round((count / total) * 100);
                    return (
                        <div key={label} className="relative group">
                            <div className="flex justify-between text-xs text-indigo-200 mb-1">
                                <span className="capitalize font-medium">{t(label)}</span>
                                <span className="font-bold text-white">{count} <span className="text-indigo-400 text-[10px]">({percent}%)</span></span>
                            </div>
                            <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r shadow-[0_0_12px_rgba(0,0,0,0.3)] ${colorClasses}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

import { t } from "../../../utils/translations";

// Vibrant palette for Pie Charts (Default)
const DEFAULT_PIE_COLORS = [
    "#22d3ee", // Cyan
    "#a78bfa", // Violet
    "#f472b6", // Pink
    "#fbbf24", // Amber
    "#34d399", // Emerald
    "#60a5fa", // Blue
    "#f87171", // Red
    "#a3e635", // Lime
];

export default function PieChartCard({ title, data, colors = DEFAULT_PIE_COLORS }) {
    if (!data || Object.keys(data).length === 0) return null;

    const total = Object.values(data).reduce((a, b) => a + b, 0);

    // Logical order for sleep ranges
    const LOGICAL_ORDER = [
        "Under 5", "under_5",
        "15 or less", "15_or_less", "Or Less 15",
        "5 6", "5_6", "6 7", "6_7",
        "7 8", "7_8", "8 9", "8_9", "9 8", "Over 9", "over_9",
        "5 15", "5_15", "15 30", "15_30", "30 60", "30_60", "Over 60", "over_60"
    ];

    const sortedEntries = Object.entries(data).sort((a, b) => {
        const indexA = LOGICAL_ORDER.indexOf(a[0]);
        const indexB = LOGICAL_ORDER.indexOf(b[0]);

        // If both are in logical order, sort by that index
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;

        // Otherwise fallback to count descending
        return b[1] - a[1];
    });

    let currentAngle = 0;
    const gradientParts = sortedEntries.map(([label, count], index) => {
        const percentage = (count / total) * 100;
        const endAngle = currentAngle + (percentage * 3.6); // 3.6 degrees per percent
        const color = colors[index % colors.length];
        const str = `${color} ${currentAngle}deg ${endAngle}deg`;
        currentAngle = endAngle;
        return str;
    });

    const gradientString = `conic-gradient(${gradientParts.join(", ")})`;

    return (
        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-4 shadow-lg mb-4 hover:border-indigo-400/50 transition-colors h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2 text-center">{title}</h3>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">
                {/* The Pie Chart */}
                <div
                    className="w-40 h-40 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] relative flex items-center justify-center group hover:scale-105 transition-transform duration-500"
                    style={{ background: gradientString }}
                >
                    {/* Donut Hole (Optional - remove for full pie) */}
                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-white leading-none">{total}</span>
                            <span className="text-[10px] text-indigo-400 uppercase tracking-widest">סה"כ</span>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="w-full space-y-2">
                    {sortedEntries.map(([label, count], index) => {
                        const color = colors[index % colors.length];
                        const percent = Math.round((count / total) * 100);
                        return (
                            <div key={label} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }}></div>
                                    <span className="text-indigo-100 capitalize">{t(label)}</span>
                                </div>
                                <span className="font-bold text-white">{count} <span className="text-indigo-400 text-[10px]">({percent}%)</span></span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

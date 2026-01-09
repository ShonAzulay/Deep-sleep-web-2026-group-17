import { useEffect, useState } from "react";
import {
  fetchAllSleepEntries,
  computeSleepStats,
} from "../services/sleepStatsService";
import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';

// Vibrant palette for Pie Charts
const PIE_COLORS = [
  "#22d3ee", // Cyan
  "#a78bfa", // Violet
  "#f472b6", // Pink
  "#fbbf24", // Amber
  "#34d399", // Emerald
  "#60a5fa", // Blue
  "#f87171", // Red
  "#a3e635", // Lime
];

// Palette for Activities
const ACTIVITY_COLORS = [
  "#f97316", // Orange
  "#2dd4bf", // Teal
  "#818cf8", // Indigo
  "#e879f9", // Fuchsia
  "#facc15", // Yellow
  "#fb7185", // Rose
  "#38bdf8", // Sky
  "#a78bfa", // Violet
];

// Palette for Fall Asleep Time
const FALL_ASLEEP_COLORS = [
  "#34d399", // Emerald
  "#a78bfa", // Violet
  "#fbbf24", // Amber
  "#f87171", // Red
  "#60a5fa", // Blue
];

// Palette for Wakeups
const WAKEUPS_COLORS = [
  "#e879f9", // Fuchsia
  "#22d3ee", // Cyan
  "#f472b6", // Pink
  "#a3e635", // Lime
];

// Palette for Sleep Quality
const QUALITY_COLORS = [
  "#facc15", // Yellow
  "#4ade80", // Green
  "#38bdf8", // Sky
  "#f43f5e", // Rose
  "#fb923c", // Orange
];

const TRANSLATIONS = {
  // Activities
  "Computer": "מחשב",
  "computer": "מחשב",
  "Phone": "נייד",
  "phone": "נייד",
  "Tablet": "טאבלט",
  "tablet": "טאבלט",
  "TV": "טלוויזיה",
  "tv": "טלוויזיה",
  "Reading": "קריאה/ספר",
  "reading": "קריאה/ספר",
  "Music": "מוזיקה",
  "music": "מוזיקה",
  "Sport": "ספורט",
  "sport": "ספורט",
  "Shower": "מקלחת",
  "shower": "מקלחת",
  "Gaming": "גיימינג",
  "gaming": "גיימינג",

  // Wake Methods
  "Natural": "טבעי",
  "natural": "טבעי",
  "Alarm": "שעון מעורר",
  "alarm": "שעון מעורר",
  "Parents": "הורים",
  "parents": "הורים",
  "Other": "אחר",
  "other": "אחר",
  "Others": "אחר",
  "others": "אחר",

  // General labels if needed, or fallback
};

function t(label) {
  if (!label) return "";
  const clean = label.toString().replace(/_/g, ' ').trim();
  const lower = clean.toLowerCase();

  if (TRANSLATIONS[clean]) return TRANSLATIONS[clean];
  if (TRANSLATIONS[lower]) return TRANSLATIONS[lower];

  // Try to find case insensitive match
  const found = Object.keys(TRANSLATIONS).find(k => k.toLowerCase() === lower);
  return found ? TRANSLATIONS[found] : clean;
}

function PieChartCard({ title, data, colors = PIE_COLORS }) {
  if (!data || Object.keys(data).length === 0) return null;

  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);

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

function StatCard({ title, data, color = "indigo" }) {
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

export default function ResearchStatsView({ onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const entries = await fetchAllSleepEntries();
        const computed = computeSleepStats(entries);
        setStats(computed);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <SpaceLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-cyan-400 text-xl font-bold animate-pulse">טוען נתונים מהגלקסיה...</p>
        </div>
      </SpaceLayout>
    );
  }

  return (
    <SpaceLayout>
      <div className="max-w-7xl mx-auto p-4 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">סטטיסטיקת מחקר</h1>
          <button
            onClick={onBack}
            className="rounded-xl border border-indigo-500/50 px-6 py-2 text-indigo-300 font-semibold hover:text-white hover:bg-white/5 transition-colors"
          >
            חזרה לדשבורד
          </button>
        </div>

        {/* Top Summary Stats */}
        <div className="flex justify-center mb-8">
          <GlassCard className="text-center py-6 px-12 transform hover:scale-105 transition-transform duration-300" glowColor="cyan">
            <div className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">{stats?.totalEntries}</div>
            <div className="text-indigo-300 text-sm mt-2 uppercase tracking-wider font-bold">סה"כ דיווחים במערכת</div>
          </GlassCard>
        </div>

        {/* Categories Grid - Mix of Pies and Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pies for Categorical Distribution */}
          <PieChartCard title="אופן יקיצה (Wake Method)" data={stats?.wakeMethod} />
          <PieChartCard title="שעות שינה (Sleep Hours)" data={stats?.hours} />
          <PieChartCard title="זמן עצימת עיניים (Eyes Closed)" data={stats?.eyeClose} />

          {/* Activity as Pie Chart now */}
          <PieChartCard title="פעילות לפני השינה" data={stats?.activities} colors={ACTIVITY_COLORS} />

          {/* New Pie Charts */}
          <PieChartCard title="זמן עד הירדמות" data={stats?.fallAsleep} colors={FALL_ASLEEP_COLORS} />
          <PieChartCard title="מספר יקיצות" data={stats?.wakeups} colors={WAKEUPS_COLORS} />
          <PieChartCard title="הערכת שינה סובייקטיבית" data={stats?.totalSleep} colors={QUALITY_COLORS} />

          {/* Bars for Time/Sequential/Counts */}
          <StatCard title="שעת הליכה לישון (Bedtime)" data={stats?.bedtime} color="blue" />
          <StatCard title="משך ערות בלילה" data={stats?.awakeDuration} color="rose" />
          <StatCard title="שעת יקיצה" data={stats?.wakeWindow} color="orange" />
        </div>

      </div>
    </SpaceLayout>
  );
}

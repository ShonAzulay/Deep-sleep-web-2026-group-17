import { useEffect, useState } from "react";
import {
  fetchAllSleepEntries,
  computeSleepStats,
} from "../../server/services/sleepStatsService";
import SpaceLayout from './ui/SpaceLayout';
import GlassCard from './ui/GlassCard';
import PieChartCard from './ui/charts/PieChartCard';
import StatCard from './ui/charts/StatCard';

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

/**
 * ResearchStatsView Component
 * ----------------------------
 * Displays statistical data visualizations for the researcher.
 * Responsibilities:
 * 1. Fetching aggregated data via `sleepStatsService`.
 * 2. Computing statistics locally.
 * 3. Rendering Pie Charts and Bar Charts using `PieChartCard` and `StatCard`.
 */
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

import { useEffect, useState } from "react";
import {
  fetchAllSleepEntries,
  computeSleepStats,
} from "../services/sleepStatsService";

function Section({ title, data }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div className="mt-5">
      <h3 className="mb-2 font-bold text-slate-900">{title}</h3>
      <div className="space-y-1 text-sm text-slate-700">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span>{key}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResearchStatsView({ onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const entries = await fetchAllSleepEntries();
      const computed = computeSleepStats(entries);
      setStats(computed);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        טוען נתונים...
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center
                 bg-slate-900 px-4"
    >
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <h1 className="text-2xl font-bold mb-4 text-slate-900">
          סטטיסטיקת שינה
        </h1>

        <p className="text-sm text-slate-600 mb-1">
          סה״כ טפסים: {stats.totalEntries}
        </p>

        <p className="text-sm text-slate-600 mb-4">
          ממוצע איכות שינה: {stats.avgQuality ?? "—"}
        </p>

        <Section title="שעות שינה" data={stats.hours} />
        <Section title="שעת הליכה לישון" data={stats.bedtime} />
        <Section title="מתי נכנסת למיטה" data={stats.bedEntry} />
        <Section title="זמן עצימת עיניים" data={stats.eyeClose} />
        <Section title="זמן עד הירדמות" data={stats.fallAsleep} />
        <Section title="מספר יקיצות בלילה" data={stats.wakeups} />
        <Section title="משך היקיצות" data={stats.awakeDuration} />
        <Section title="שעת התעוררות" data={stats.wakeWindow} />
        <Section title="אופן ההתעוררות" data={stats.wakeMethod} />
        <Section title="הערכת שעות שינה כוללת" data={stats.totalSleep} />
        <Section title="פעילות לפני שינה" data={stats.activities} />

        <button
          onClick={onBack}
          className="mt-6 w-full rounded-xl bg-slate-900 py-3 text-white font-bold"
        >
          חזרה
        </button>
      </div>
    </div>
  );
}

import { db } from "../firebase";
import { collectionGroup, getDocs, query } from "firebase/firestore";

// שליפת כל הטפסים מכל הניסויים והכיתות
export async function fetchAllSleepEntries() {
  // שימוש ב-collectionGroup כדי לשלוף את כל המסמכים בקולקציית "responses"
  // לא משנה איפה הם נמצאים בהיררכיה
  const q = query(collectionGroup(db, "responses"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// חישוב סטטיסטיקה לכל השאלות
export function computeSleepStats(entries) {
  const total = entries.length;

  const hours = {};
  const bedtime = {};
  const bedEntry = {};
  const eyeClose = {};
  const fallAsleep = {};
  const wakeups = {};
  const awakeDuration = {};
  const wakeWindow = {};
  const wakeMethod = {};
  const totalSleep = {};
  const activities = {};

  let qualitySum = 0;
  let qualityCount = 0;

  function inc(map, key) {
    if (!key) return;
    map[key] = (map[key] || 0) + 1;
  }

  entries.forEach(e => {
    inc(hours, e.hours);
    inc(bedtime, e.bedtime);
    inc(bedEntry, e.bed_entry);
    inc(eyeClose, e.eye_close_time);
    inc(fallAsleep, e.time_to_fall_asleep);
    inc(wakeups, e.wakeups_count);
    inc(awakeDuration, e.awake_duration);
    inc(wakeWindow, e.wake_up_window);
    inc(wakeMethod, e.wake_up_method);
    inc(totalSleep, e.total_sleep_estimate);

    if (Array.isArray(e.pre_sleep_activity)) {
      e.pre_sleep_activity.forEach(a => inc(activities, a));
    }

    if (typeof e.quality === "number") {
      qualitySum += e.quality;
      qualityCount++;
    }
  });

  return {
    totalEntries: total,
    avgQuality: qualityCount
      ? (qualitySum / qualityCount).toFixed(2)
      : null,

    hours,
    bedtime,
    bedEntry,
    eyeClose,
    fallAsleep,
    wakeups,
    awakeDuration,
    wakeWindow,
    wakeMethod,
    totalSleep,
    activities,
  };
}

/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer.
 * It abstracts the database operations (Firebase) from the client-side View layer.
 * All direct DB access should happen here.
 */
import { db } from "../firebase";
import { collectionGroup, getDocs, query } from "firebase/firestore";

// Fetch all forms from all experiments and classes
export async function fetchAllSleepEntries() {
  // Use collectionGroup to fetch all documents in "responses" collection
  // Regardless of where they are in the hierarchy
  const q = query(collectionGroup(db, "responses"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Fetch forms for a specific class (for teacher)
import { collection } from "firebase/firestore";
export async function fetchClassSleepEntries(experimentId, classId) {
  if (!experimentId || !classId) return [];
  const colRef = collection(db, "experiments", experimentId, "classes", classId, "responses");
  const snap = await getDocs(colRef);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Compute statistics for all questions
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

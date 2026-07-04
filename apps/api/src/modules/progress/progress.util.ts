export interface EventLike {
  createdAt: Date;
  hoursSpent: number;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Consecutive-day streak ending today (or yesterday if nothing logged today yet).
 * Returns the number of consecutive active days up to the most recent active day,
 * counting only if that most recent day is today or yesterday.
 */
export function computeStreak(events: EventLike[], now = new Date()): number {
  if (events.length === 0) return 0;
  const days = new Set(events.map((e) => dayKey(e.createdAt)));

  const today = new Date(now);
  const todayKey = dayKey(today);
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yKey = dayKey(yesterday);

  // Determine the anchor: today if active, else yesterday if active, else 0.
  let anchor: Date;
  if (days.has(todayKey)) anchor = today;
  else if (days.has(yKey)) anchor = yesterday;
  else return 0;

  let streak = 0;
  const cursor = new Date(anchor);
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/** Sum hours within the last `days` days. */
export function hoursInLastDays(events: EventLike[], days: number, now = new Date()): number {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const sum = events
    .filter((e) => e.createdAt >= cutoff)
    .reduce((acc, e) => acc + e.hoursSpent, 0);
  return Math.round(sum * 10) / 10;
}

/** Hours grouped by ISO weekday for the last 7 days (heatmap). */
export function dailyHeatmap(events: EventLike[], now = new Date()): { day: string; hours: number }[] {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const buckets: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    buckets[dayKey(d)] = 0;
  }
  for (const e of events) {
    const k = dayKey(e.createdAt);
    if (k in buckets) buckets[k] += e.hoursSpent;
  }
  return Object.entries(buckets).map(([k, hours]) => {
    const d = new Date(k + 'T00:00:00Z');
    const idx = (d.getUTCDay() + 6) % 7; // Mon=0
    return { day: labels[idx], hours: Math.round(hours * 10) / 10 };
  });
}

/** Hours per week for the last `weeks` weeks. */
export function weeklySeries(events: EventLike[], weeks = 6, now = new Date()): { week: string; hours: number }[] {
  const out: { week: string; hours: number }[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const end = new Date(now);
    end.setUTCDate(end.getUTCDate() - w * 7);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - 7);
    const hours = events
      .filter((e) => e.createdAt > start && e.createdAt <= end)
      .reduce((acc, e) => acc + e.hoursSpent, 0);
    out.push({ week: `W${weeks - w}`, hours: Math.round(hours * 10) / 10 });
  }
  return out;
}

import { computeStreak, hoursInLastDays, EventLike } from './progress.util';

function daysAgo(n: number, hours = 1): EventLike {
  const d = new Date('2026-07-01T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - n);
  return { createdAt: d, hoursSpent: hours };
}

const NOW = new Date('2026-07-01T12:00:00Z');

describe('streak calculation', () => {
  it('is 0 with no events', () => {
    expect(computeStreak([], NOW)).toBe(0);
  });

  it('counts consecutive days including today', () => {
    const events = [daysAgo(0), daysAgo(1), daysAgo(2)];
    expect(computeStreak(events, NOW)).toBe(3);
  });

  it('counts from yesterday if nothing logged today', () => {
    const events = [daysAgo(1), daysAgo(2)];
    expect(computeStreak(events, NOW)).toBe(2);
  });

  it('breaks the streak on a gap', () => {
    const events = [daysAgo(0), daysAgo(1), daysAgo(3)];
    expect(computeStreak(events, NOW)).toBe(2);
  });

  it('is 0 when the most recent activity is older than yesterday', () => {
    expect(computeStreak([daysAgo(3), daysAgo(4)], NOW)).toBe(0);
  });

  it('does not double-count multiple events on the same day', () => {
    expect(computeStreak([daysAgo(0), daysAgo(0), daysAgo(1)], NOW)).toBe(2);
  });
});

describe('hoursInLastDays', () => {
  it('sums only events within the window', () => {
    const events = [daysAgo(0, 2), daysAgo(2, 3), daysAgo(10, 5)];
    expect(hoursInLastDays(events, 7, NOW)).toBe(5);
  });
});

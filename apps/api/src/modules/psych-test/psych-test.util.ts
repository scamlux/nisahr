import {
  AXES,
  PROFESSIONS,
  ProfessionDef,
  QUESTIONS,
  RiasecAxis,
} from './riasec.data';

export interface PsychAnswer {
  questionId: string;
  /** Likert 1..5 */
  value: number;
}

export type PsychAxes = Record<RiasecAxis, number>;

/**
 * Deterministic RIASEC scoring: per-axis mean of Likert answers scaled to
 * 0..100. Unanswered questions count as neutral (3) so partial submissions
 * still produce a stable, comparable profile.
 */
export function scoreAnswers(answers: PsychAnswer[]): {
  axes: PsychAxes;
  profileCode: string;
} {
  const byId = new Map(answers.map((a) => [a.questionId, a.value]));
  const sums: Record<RiasecAxis, { total: number; count: number }> = {
    R: { total: 0, count: 0 },
    I: { total: 0, count: 0 },
    A: { total: 0, count: 0 },
    S: { total: 0, count: 0 },
    E: { total: 0, count: 0 },
    C: { total: 0, count: 0 },
  };

  for (const q of QUESTIONS) {
    const raw = byId.get(q.id);
    const value = typeof raw === 'number' ? Math.min(5, Math.max(1, raw)) : 3;
    sums[q.axis].total += value;
    sums[q.axis].count += 1;
  }

  const axes = {} as PsychAxes;
  for (const axis of AXES) {
    const { total, count } = sums[axis];
    // Likert mean 1..5 → 0..100
    axes[axis] = Math.round(((total / count - 1) / 4) * 100);
  }

  // Top-3 letters; deterministic tie-break by canonical axis order.
  const profileCode = [...AXES]
    .sort((a, b) => axes[b] - axes[a] || AXES.indexOf(a) - AXES.indexOf(b))
    .slice(0, 3)
    .join('');

  return { axes, profileCode };
}

export interface ProfessionMatch extends ProfessionDef {
  matchScore: number;
}

/**
 * Deterministic axis→profession matching: weighted affinity between the
 * user's normalized axes and each profession vector, presented as 40..99 %.
 */
export function matchProfessions(axes: PsychAxes, limit = 5): ProfessionMatch[] {
  const scored = PROFESSIONS.map((p) => {
    let affinity = 0;
    for (const axis of AXES) {
      affinity += (p.vector[axis] ?? 0) * (axes[axis] / 100);
    }
    // affinity ∈ [0,1] → presentable match %
    const matchScore = Math.round(40 + affinity * 59);
    return { ...p, matchScore };
  });

  return scored
    .sort(
      (a, b) => b.matchScore - a.matchScore || a.slug.localeCompare(b.slug),
    )
    .slice(0, Math.max(3, Math.min(limit, 7)));
}

export interface InterviewTurn {
  question: string;
  answer?: string;
  score?: number;
  feedback?: string;
}

export interface InterviewBreakdown {
  communication: number;
  specificity: number;
  structure: number;
}

export interface InterviewReport {
  overall: number;
  breakdown: InterviewBreakdown;
  strengths: string[];
  improvements: string[];
  answered: number;
  total: number;
}

const STRUCTURE_RE =
  /\b(first|then|next|after that|finally|because|so that|as a result|therefore|result|i (led|built|created|designed|implemented|decided|solved))\b/i;
const METRIC_RE = /\d/;
const EXAMPLE_RE =
  /\b(example|for instance|project|built|shipped|launched|team|customer|user|client)\b/i;

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Score a single answer across the three report dimensions (0-100 each). */
export function scoreAnswerDimensions(answer: string): InterviewBreakdown {
  const text = (answer ?? '').trim();
  const len = text.length;

  // Communication: enough detail & clarity, plateauing with length.
  const communication = clamp(35 + Math.min(55, len / 4));

  // Structure: explicit situation → action → result markers.
  const structure = clamp((STRUCTURE_RE.test(text) ? 70 : 35) + (len > 140 ? 20 : 0));

  // Specificity: concrete examples and quantified impact.
  let spec = 30;
  if (METRIC_RE.test(text)) spec += 35;
  if (EXAMPLE_RE.test(text)) spec += 25;
  if (len > 120) spec += 10;
  const specificity = clamp(spec);

  return { communication, specificity, structure };
}

/**
 * Build a full interview report from the transcript. `overallScore`, when the
 * interview is complete, is the authoritative per-answer mean shown live; the
 * report falls back to the dimension mean otherwise.
 */
export function computeInterviewReport(
  turns: InterviewTurn[],
  overallScore?: number,
): InterviewReport {
  const total = turns.length;
  const answered = turns.filter(
    (t) => typeof t.answer === 'string' && t.answer.trim().length > 0,
  );

  if (answered.length === 0) {
    return {
      overall: overallScore ?? 0,
      breakdown: { communication: 0, specificity: 0, structure: 0 },
      strengths: [],
      improvements: ['Complete the interview to unlock your full report.'],
      answered: 0,
      total,
    };
  }

  const dims = answered.map((t) => scoreAnswerDimensions(t.answer as string));
  const avg = (key: keyof InterviewBreakdown) =>
    clamp(dims.reduce((a, d) => a + d[key], 0) / dims.length);

  const breakdown: InterviewBreakdown = {
    communication: avg('communication'),
    specificity: avg('specificity'),
    structure: avg('structure'),
  };

  const overall =
    overallScore ??
    clamp((breakdown.communication + breakdown.specificity + breakdown.structure) / 3);

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (breakdown.structure >= 70)
    strengths.push('Well-structured answers using a clear situation → action → result flow.');
  else
    improvements.push('Structure answers explicitly: the situation, the actions you took, then the result.');

  if (breakdown.specificity >= 70)
    strengths.push('Backed your answers with concrete examples and measurable outcomes.');
  else
    improvements.push('Add concrete examples and quantify your impact (numbers, %, scale).');

  if (breakdown.communication >= 70)
    strengths.push('Communicated clearly with the right level of detail.');
  else
    improvements.push('Expand thinner answers — give a little more context and detail.');

  if (strengths.length === 0)
    strengths.push('Engaged with every question and completed the full interview.');

  return { overall, breakdown, strengths, improvements, answered: answered.length, total };
}

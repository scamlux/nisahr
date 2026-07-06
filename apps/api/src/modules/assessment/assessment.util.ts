import { randomBytes, randomInt } from 'crypto';
import { AssessmentBank, AssessmentQuestion } from './question-bank';

export interface SubmittedAnswer {
  questionId: string;
  selectedIndex: number;
}

/** Fisher–Yates shuffle (unbiased) returning a new array. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `count` questions for an attempt and return their ids in served order.
 * Anti-cheat: order is randomized per attempt and persisted, so the answer key
 * mapping is stable server-side without ever exposing correctIndex.
 */
export function pickQuestionOrder(bank: AssessmentBank, count: number): string[] {
  return shuffle(bank.questions).slice(0, Math.min(count, bank.questions.length)).map((q) => q.id);
}

/**
 * Deterministic scoring. Only questions actually served (in questionOrder) count,
 * so a client cannot inflate the total. Returns an integer percentage 0..100.
 */
export function scoreAttempt(
  bank: AssessmentBank,
  questionOrder: string[],
  answers: SubmittedAnswer[],
): { score: number; correct: number; total: number } {
  const byId = new Map<string, AssessmentQuestion>(bank.questions.map((q) => [q.id, q]));
  const answerFor = new Map<string, number>();
  for (const a of answers) answerFor.set(a.questionId, a.selectedIndex);

  const served = questionOrder.filter((id) => byId.has(id));
  const total = served.length;
  let correct = 0;
  for (const id of served) {
    const q = byId.get(id)!;
    if (answerFor.get(id) === q.correctIndex) correct++;
  }
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { score, correct, total };
}

/** Human-readable certificate serial, e.g. CO-2026-7F3A9K. Not a security token. */
export function generateSerial(year: number): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let s = '';
  for (let i = 0; i < 6; i++) s += alphabet[randomInt(0, alphabet.length)];
  return `CO-${year}-${s}`;
}

/**
 * Unguessable verification token. Crypto-random (NOT a cuid — cuids encode a
 * timestamp+counter and are enumerable). This token is the sole public gate on
 * certificate authenticity.
 */
export function generateVerifyToken(): string {
  return randomBytes(24).toString('base64url');
}

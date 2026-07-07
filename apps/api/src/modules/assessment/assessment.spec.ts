import { findBank, publicQuestion, QUESTION_BANKS } from './question-bank';
import {
  generateSerial,
  generateVerifyToken,
  pickQuestionOrder,
  scoreAttempt,
} from './assessment.util';

describe('question bank', () => {
  it('has unique question ids within every bank', () => {
    for (const bank of QUESTION_BANKS) {
      const ids = bank.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('every question has a valid correctIndex within its options', () => {
    for (const bank of QUESTION_BANKS) {
      for (const q of bank.questions) {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      }
    }
  });

  it('has at least 8 questions per bank (enough to serve a full attempt)', () => {
    for (const bank of QUESTION_BANKS) {
      expect(bank.questions.length).toBeGreaterThanOrEqual(8);
    }
  });

  it('publicQuestion never leaks the answer key', () => {
    const q = QUESTION_BANKS[0].questions[0];
    const pub = publicQuestion(q) as unknown as Record<string, unknown>;
    expect(pub.correctIndex).toBeUndefined();
    expect(Object.keys(pub).sort()).toEqual(['id', 'options', 'prompt', 'topic']);
  });

  it('resolves aliases and free-text roles, falling back to general', () => {
    expect(findBank('frontend-developer').slug).toBe('frontend-developer');
    expect(findBank('Frontend').slug).toBe('frontend-developer');
    expect(findBank('Senior Backend Developer').slug).toBe('backend-developer');
    expect(findBank('astronaut').slug).toBe('general');
  });
});

describe('scoring', () => {
  const bank = findBank('backend-developer');

  it('scores a perfect attempt as 100', () => {
    const order = bank.questions.map((q) => q.id);
    const answers = bank.questions.map((q) => ({ questionId: q.id, selectedIndex: q.correctIndex }));
    const r = scoreAttempt(bank, order, answers);
    expect(r.score).toBe(100);
    expect(r.correct).toBe(r.total);
  });

  it('scores an all-wrong attempt as 0', () => {
    const order = bank.questions.map((q) => q.id);
    const answers = bank.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: (q.correctIndex + 1) % q.options.length,
    }));
    expect(scoreAttempt(bank, order, answers).score).toBe(0);
  });

  it('only counts served questions in the total (no inflation)', () => {
    const order = bank.questions.slice(0, 4).map((q) => q.id);
    // answer ALL questions correctly, but only 4 were served
    const answers = bank.questions.map((q) => ({ questionId: q.id, selectedIndex: q.correctIndex }));
    const r = scoreAttempt(bank, order, answers);
    expect(r.total).toBe(4);
    expect(r.score).toBe(100);
  });

  it('is deterministic for the same inputs', () => {
    const order = bank.questions.map((q) => q.id);
    const answers = bank.questions.map((q) => ({ questionId: q.id, selectedIndex: 1 }));
    expect(scoreAttempt(bank, order, answers)).toEqual(scoreAttempt(bank, order, answers));
  });
});

describe('anti-cheat helpers', () => {
  it('serves the requested number of questions', () => {
    const bank = findBank('frontend-developer');
    expect(pickQuestionOrder(bank, 8)).toHaveLength(8);
    expect(new Set(pickQuestionOrder(bank, 8)).size).toBe(8); // no duplicates
  });

  it('verify tokens are unguessable and unique', () => {
    const a = generateVerifyToken();
    const b = generateVerifyToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(32); // 24 random bytes, base64url
    expect(a).not.toMatch(/^c[a-z0-9]{24}$/); // not a cuid shape
  });

  it('serials are human-readable and namespaced by year', () => {
    expect(generateSerial(2026)).toMatch(/^CO-2026-[A-HJ-NP-Z2-9]{6}$/);
  });
});

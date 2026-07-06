import { matchProfessions, scoreAnswers, PsychAnswer } from './psych-test.util';
import { AXES, QUESTIONS } from './riasec.data';

function answersWhere(fn: (axis: string) => number): PsychAnswer[] {
  return QUESTIONS.map((q) => ({ questionId: q.id, value: fn(q.axis) }));
}

describe('psych-test scoring (deterministic)', () => {
  it('identical answers always produce the identical profile', () => {
    const answers = answersWhere((axis) => (axis === 'I' ? 5 : axis === 'A' ? 4 : 2));
    const a = scoreAnswers(answers);
    const b = scoreAnswers([...answers].reverse());
    expect(a).toEqual(b);
  });

  it('scales Likert means to 0..100 per axis', () => {
    const all5 = scoreAnswers(answersWhere(() => 5));
    const all1 = scoreAnswers(answersWhere(() => 1));
    const all3 = scoreAnswers(answersWhere(() => 3));
    for (const axis of AXES) {
      expect(all5.axes[axis]).toBe(100);
      expect(all1.axes[axis]).toBe(0);
      expect(all3.axes[axis]).toBe(50);
    }
  });

  it('profileCode is the top-3 axes with deterministic tie-break', () => {
    const { profileCode } = scoreAnswers(
      answersWhere((axis) => (axis === 'S' ? 5 : axis === 'E' ? 4 : axis === 'C' ? 4 : 1)),
    );
    // S strongest; E and C tie → canonical order puts E before C
    expect(profileCode).toBe('SEC');
  });

  it('treats missing answers as neutral instead of failing', () => {
    const partial = answersWhere(() => 5).slice(0, 12);
    const { axes } = scoreAnswers(partial);
    for (const axis of AXES) {
      expect(axes[axis]).toBeGreaterThanOrEqual(0);
      expect(axes[axis]).toBeLessThanOrEqual(100);
    }
  });

  it('clamps out-of-range values', () => {
    const { axes } = scoreAnswers(
      QUESTIONS.map((q) => ({ questionId: q.id, value: q.axis === 'R' ? 99 : -7 })),
    );
    expect(axes.R).toBe(100);
    expect(axes.I).toBe(0);
  });
});

describe('psych-test profession matching (deterministic)', () => {
  const investigative = scoreAnswers(
    answersWhere((axis) => (axis === 'I' ? 5 : axis === 'C' ? 4 : 2)),
  );

  it('returns between 3 and 7 ranked professions', () => {
    expect(matchProfessions(investigative.axes, 1).length).toBe(3);
    expect(matchProfessions(investigative.axes, 5).length).toBe(5);
    expect(matchProfessions(investigative.axes, 99).length).toBe(7);
  });

  it('ranks by descending matchScore', () => {
    const matches = matchProfessions(investigative.axes, 7);
    for (let i = 1; i < matches.length; i++) {
      expect(matches[i - 1].matchScore).toBeGreaterThanOrEqual(matches[i].matchScore);
    }
  });

  it('an investigative profile prefers analytical roles over people roles', () => {
    const slugs = matchProfessions(investigative.axes, 7).map((m) => m.slug);
    const analytical = slugs.indexOf('backend-developer');
    const people = slugs.indexOf('hr-people-ops');
    expect(analytical).toBeGreaterThanOrEqual(0);
    expect(people === -1 || people > analytical).toBe(true);
  });

  it('a social-enterprising profile surfaces people roles first', () => {
    const social = scoreAnswers(
      answersWhere((axis) => (axis === 'S' ? 5 : axis === 'E' ? 5 : 2)),
    );
    const top = matchProfessions(social.axes, 5)[0];
    expect(['hr-people-ops', 'product-manager', 'project-manager', 'digital-marketer']).toContain(
      top.slug,
    );
  });

  it('matchScore stays within the presentable 40..99 band', () => {
    for (const m of matchProfessions(investigative.axes, 7)) {
      expect(m.matchScore).toBeGreaterThanOrEqual(40);
      expect(m.matchScore).toBeLessThanOrEqual(99);
    }
  });
});

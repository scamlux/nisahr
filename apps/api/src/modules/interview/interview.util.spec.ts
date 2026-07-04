import {
  computeInterviewReport,
  scoreAnswerDimensions,
  InterviewTurn,
} from './interview.util';

describe('interview report', () => {
  it('returns an empty report when nothing is answered', () => {
    const turns: InterviewTurn[] = [{ question: 'Q1' }, { question: 'Q2' }];
    const report = computeInterviewReport(turns);
    expect(report.answered).toBe(0);
    expect(report.total).toBe(2);
    expect(report.breakdown).toEqual({ communication: 0, specificity: 0, structure: 0 });
    expect(report.improvements.length).toBeGreaterThan(0);
  });

  it('rewards structured, specific, detailed answers', () => {
    const strong =
      'First I identified the bottleneck, then I rewrote the query and added an index. ' +
      'As a result I cut p95 latency by 40% for about 12000 users on our main project.';
    const dims = scoreAnswerDimensions(strong);
    expect(dims.structure).toBeGreaterThanOrEqual(70);
    expect(dims.specificity).toBeGreaterThanOrEqual(70);
    expect(dims.communication).toBeGreaterThanOrEqual(70);
  });

  it('penalizes short, vague answers', () => {
    const weak = scoreAnswerDimensions('I fixed it.');
    expect(weak.specificity).toBeLessThan(70);
    expect(weak.communication).toBeLessThan(70);
  });

  it('uses the provided overall score when complete', () => {
    const turns: InterviewTurn[] = [
      { question: 'Q1', answer: 'I led the team and shipped the feature, improving signups 20%.' },
    ];
    const report = computeInterviewReport(turns, 88);
    expect(report.overall).toBe(88);
    expect(report.answered).toBe(1);
  });

  it('produces strengths for a strong interview and improvements for a weak one', () => {
    const strong: InterviewTurn[] = [
      {
        question: 'Q1',
        answer:
          'First I scoped the problem, then I built a prototype and finally measured results: ' +
          'a 30% lift across 5000 customers on the project.',
      },
    ];
    const weak: InterviewTurn[] = [{ question: 'Q1', answer: 'It was fine.' }];
    expect(computeInterviewReport(strong).strengths.length).toBeGreaterThan(0);
    expect(computeInterviewReport(weak).improvements.length).toBeGreaterThan(0);
  });
});

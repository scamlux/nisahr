import {
  computeRoadmapCompletion,
  computeStageCompletion,
  deriveStageStatus,
  StageLike,
} from './roadmap.util';

const stage = (skills: string[], tasks: boolean[], status = 'NOT_STARTED'): StageLike => ({
  status,
  stageSkills: skills.map((s) => ({ status: s })),
  tasks: tasks.map((t) => ({ completed: t })),
});

describe('roadmap completion', () => {
  it('is 0 for an untouched stage', () => {
    expect(computeStageCompletion(stage(['NOT_STARTED', 'NOT_STARTED'], [false]))).toBe(0);
  });

  it('is 100 when all skills and tasks done', () => {
    expect(computeStageCompletion(stage(['DONE', 'DONE'], [true]))).toBe(100);
  });

  it('is proportional for partial completion', () => {
    // 2 of 4 items done = 50
    expect(computeStageCompletion(stage(['DONE', 'NOT_STARTED'], [true, false]))).toBe(50);
  });

  it('falls back to stage status when no skills/tasks', () => {
    expect(computeStageCompletion(stage([], [], 'DONE'))).toBe(100);
    expect(computeStageCompletion(stage([], [], 'NOT_STARTED'))).toBe(0);
  });

  it('averages stage completions across a roadmap', () => {
    const s1 = stage(['DONE', 'DONE'], [true]); // 100
    const s2 = stage(['NOT_STARTED', 'NOT_STARTED'], [false]); // 0
    expect(computeRoadmapCompletion([s1, s2])).toBe(50);
  });

  it('derives status from progress', () => {
    expect(deriveStageStatus(stage(['NOT_STARTED'], [false]))).toBe('NOT_STARTED');
    expect(deriveStageStatus(stage(['DONE'], [false]))).toBe('IN_PROGRESS');
    expect(deriveStageStatus(stage(['DONE'], [true]))).toBe('DONE');
  });
});

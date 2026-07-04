export interface StageLike {
  status: string;
  stageSkills: { status: string }[];
  tasks: { completed: boolean }[];
}

/** Stage completion 0-100 from its skills + tasks (status falls back to skills/tasks). */
export function computeStageCompletion(stage: StageLike): number {
  const totalSkills = stage.stageSkills.length;
  const doneSkills = stage.stageSkills.filter((s) => s.status === 'DONE').length;
  const totalTasks = stage.tasks.length;
  const doneTasks = stage.tasks.filter((t) => t.completed).length;
  const total = totalSkills + totalTasks;
  if (total === 0) return stage.status === 'DONE' ? 100 : 0;
  return Math.round(((doneSkills + doneTasks) / total) * 100);
}

/** Overall roadmap completion = mean of stage completions. */
export function computeRoadmapCompletion(stages: StageLike[]): number {
  if (stages.length === 0) return 0;
  const sum = stages.reduce((acc, s) => acc + computeStageCompletion(s), 0);
  return Math.round(sum / stages.length);
}

/** Derive a stage status from its underlying progress. */
export function deriveStageStatus(stage: StageLike): 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' {
  const pct = computeStageCompletion(stage);
  if (pct >= 100) return 'DONE';
  if (pct > 0) return 'IN_PROGRESS';
  return 'NOT_STARTED';
}

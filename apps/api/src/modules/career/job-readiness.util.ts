import { JobReadinessBreakdown } from '@careeros/shared';

/** Weighted overall job-readiness score 0-100 from its components. */
export function computeJobReadinessScore(b: JobReadinessBreakdown): number {
  return Math.round(
    b.skillsCoverage * 0.35 +
      b.roadmapProgress * 0.25 +
      b.resumeScore * 0.2 +
      b.interviewScore * 0.2,
  );
}

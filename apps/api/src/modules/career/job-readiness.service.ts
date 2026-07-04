import { Injectable } from '@nestjs/common';
import { JobReadinessBreakdown } from '@careeros/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { computeJobReadinessScore } from './job-readiness.util';

@Injectable()
export class JobReadinessService {
  constructor(private readonly prisma: PrismaService) {}

  async compute(userId: string, targetRole: string) {
    // Skills coverage + roadmap progress from the user's roadmap(s).
    const roadmaps = await this.prisma.roadmap.findMany({
      where: { userId },
      include: { stages: { include: { stageSkills: true } } },
    });
    const relevant =
      roadmaps.find((r) => r.targetRole.toLowerCase() === targetRole.toLowerCase()) ??
      roadmaps[0];

    let roadmapProgress = 0;
    let skillsCoverage = 0;
    if (relevant) {
      const stages = relevant.stages;
      const doneStages = stages.filter((s) => s.status === 'DONE').length;
      roadmapProgress = stages.length ? Math.round((doneStages / stages.length) * 100) : 0;
      const allSkills = stages.flatMap((s) => s.stageSkills);
      const doneSkills = allSkills.filter((s) => s.status === 'DONE').length;
      skillsCoverage = allSkills.length ? Math.round((doneSkills / allSkills.length) * 100) : 0;
    }

    const lastResume = await this.prisma.resumeReview.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    const resumeScore = lastResume ? Math.round(lastResume.score) : 0;

    const interviews = await this.prisma.mockInterview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    const interviewScore = interviews.length
      ? Math.round(interviews.reduce((a, b) => a + b.score, 0) / interviews.length)
      : 0;

    const breakdown: JobReadinessBreakdown = {
      skillsCoverage,
      roadmapProgress,
      resumeScore,
      interviewScore,
    };

    // Weighted overall score.
    const score = computeJobReadinessScore(breakdown);

    await this.prisma.jobReadiness.create({
      data: { userId, targetRole, score, breakdown: breakdown as object },
    });

    return { targetRole, score, breakdown };
  }
}

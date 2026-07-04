import { Injectable } from '@nestjs/common';
import { ProgressDashboard } from '@careeros/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { computeRoadmapCompletion } from '../roadmap/roadmap.util';
import {
  computeStreak,
  dailyHeatmap,
  hoursInLastDays,
  weeklySeries,
} from './progress.util';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  private async loadEvents(userId: string) {
    return this.prisma.progressEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async dashboard(userId: string): Promise<ProgressDashboard> {
    const events = await this.loadEvents(userId);

    const roadmaps = await this.prisma.roadmap.findMany({
      where: { userId },
      include: { stages: { include: { stageSkills: true, tasks: true } } },
    });
    const roadmapCompletion = roadmaps.length
      ? Math.round(
          roadmaps.reduce((acc, r) => acc + computeRoadmapCompletion(r.stages), 0) /
            roadmaps.length,
        )
      : 0;

    const completedSkills = await this.prisma.roadmapStageSkill.count({
      where: { stage: { roadmap: { userId } }, status: 'DONE' },
    });
    const completedCourses = await this.prisma.certificate.count({ where: { userId } });

    return {
      roadmapCompletion,
      streakDays: computeStreak(events),
      weeklyHours: hoursInLastDays(events, 7),
      monthlyHours: hoursInLastDays(events, 30),
      completedSkills,
      completedCourses,
      skillHeatmap: dailyHeatmap(events),
      weeklySeries: weeklySeries(events),
    };
  }

  async insights(userId: string) {
    const dash = await this.dashboard(userId);
    return this.ai.insights({
      streakDays: dash.streakDays,
      weeklyHours: dash.weeklyHours,
      roadmapCompletion: dash.roadmapCompletion,
      completedSkills: dash.completedSkills,
    });
  }
}

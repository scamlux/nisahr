import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AddTaskDto,
  ExperienceLevel,
  GenerateRoadmapDto,
  Plan,
  SkillStatus,
  StageStatus,
} from '@careeros/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { billingEnabled } from '../../common/guards/plan.guard';
import { RoadmapGraphService } from './roadmap-graph.service';
import { computeGraphCompletion } from './roadmap-graph.service';
import {
  computeRoadmapCompletion,
  computeStageCompletion,
  deriveStageStatus,
  StageLike,
} from './roadmap.util';

@Injectable()
export class RoadmapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly graph: RoadmapGraphService,
  ) {}

  private fullInclude = {
    stages: {
      orderBy: { order: 'asc' as const },
      include: {
        stageSkills: { include: { skill: true } },
        resources: true,
        tasks: true,
      },
    },
    nodes: {
      orderBy: { order: 'asc' as const },
      include: { resources: true },
    },
    edges: true,
  };

  async generate(userId: string, dto: GenerateRoadmapDto, plan: string, role: string) {
    // Plan gating: FREE users may keep only 1 roadmap (inert while billing is off).
    if (billingEnabled() && plan !== Plan.PREMIUM && role !== 'ADMIN') {
      const count = await this.prisma.roadmap.count({ where: { userId } });
      if (count >= 1) {
        throw new ForbiddenException({
          message: 'FREE plan is limited to 1 roadmap. Upgrade to PREMIUM for unlimited roadmaps.',
          code: 'UPGRADE_REQUIRED',
        });
      }
    }

    const profile = await this.prisma.careerProfile.findUnique({ where: { userId } });
    const ai = await this.ai.generateRoadmap(
      dto.targetRole,
      dto.level as ExperienceLevel,
      dto.weeklyHours,
      profile
        ? {
            interests: profile.interests,
            currentSkills: Array.isArray(profile.currentSkills)
              ? (profile.currentSkills as string[])
              : [],
          }
        : undefined,
    );

    const roadmap = await this.prisma.roadmap.create({
      data: {
        userId,
        targetRole: ai.targetRole,
        level: dto.level as ExperienceLevel,
        weeklyHours: dto.weeklyHours,
        estimatedWeeks: ai.estimatedWeeks,
        isAiGenerated: true,
        stages: {
          create: ai.stages.map((s) => ({
            order: s.order,
            title: s.title,
            description: s.description,
            milestone: s.milestone,
            resources: {
              create: s.resources.map((r) => ({
                title: r.title,
                type: r.type,
                url: r.url,
                provider: r.provider,
                durationMin: r.durationMin,
              })),
            },
            tasks: {
              create: s.tasks.map((t) => ({
                title: t.title,
                description: t.description,
                isAutoChecked: t.isAutoChecked,
              })),
            },
          })),
        },
      },
      include: this.fullInclude,
    });

    // Attach skills (upsert Skill catalog, then link via RoadmapStageSkill).
    for (let i = 0; i < ai.stages.length; i++) {
      const aiStage = ai.stages[i];
      const dbStage = roadmap.stages[i];
      for (const sk of aiStage.skills) {
        const skill = await this.prisma.skill.upsert({
          where: { name: sk.name },
          update: { category: sk.category },
          create: { name: sk.name, category: sk.category },
        });
        await this.prisma.roadmapStageSkill.create({
          data: { stageId: dbStage.id, skillId: skill.id },
        });
        // Link resources tied to this skill name (best-effort).
      }
    }

    // F4: when a graph template matches the role, attach a flowchart too.
    try {
      await this.graph.attachGraphForRole(userId, roadmap.id, dto.targetRole);
    } catch {
      // graph attach is best-effort; the stage roadmap remains fully usable
    }

    return this.get(userId, roadmap.id);
  }

  async list(userId: string) {
    const roadmaps = await this.prisma.roadmap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: this.fullInclude,
    });
    return roadmaps.map((r) => this.decorate(r));
  }

  private async owned(userId: string, roadmapId: string) {
    const roadmap = await this.prisma.roadmap.findUnique({ where: { id: roadmapId } });
    if (!roadmap) throw new NotFoundException('Roadmap not found');
    if (roadmap.userId !== userId) throw new ForbiddenException();
    return roadmap;
  }

  async get(userId: string, roadmapId: string) {
    await this.owned(userId, roadmapId);
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: this.fullInclude,
    });
    return this.decorate(roadmap!);
  }

  private decorate(roadmap: any) {
    const stages = roadmap.stages.map((s: StageLike & { id: string }) => ({
      ...s,
      completion: computeStageCompletion(s),
      derivedStatus: deriveStageStatus(s),
      skills: (s as any).stageSkills.map((ss: any) => ({
        id: ss.id,
        skillId: ss.skillId,
        name: ss.skill.name,
        category: ss.skill.category,
        status: ss.status,
      })),
    }));
    return {
      ...roadmap,
      stages,
      completion: roadmap.useGraph
        ? computeGraphCompletion(roadmap.nodes ?? [])
        : computeRoadmapCompletion(roadmap.stages),
    };
  }

  private async recomputeAndSyncStage(stageId: string) {
    const stage = await this.prisma.roadmapStage.findUnique({
      where: { id: stageId },
      include: { stageSkills: true, tasks: true },
    });
    if (!stage) return;
    const status = deriveStageStatus(stage as StageLike);
    await this.prisma.roadmapStage.update({ where: { id: stageId }, data: { status } });
  }

  async setStageStatus(userId: string, roadmapId: string, stageId: string, status: StageStatus) {
    await this.owned(userId, roadmapId);
    await this.prisma.roadmapStage.update({ where: { id: stageId }, data: { status } });
    // When marking DONE manually, mark all skills/tasks done too.
    if (status === StageStatus.DONE) {
      await this.prisma.roadmapStageSkill.updateMany({
        where: { stageId },
        data: { status: SkillStatus.DONE },
      });
      await this.prisma.practicalTask.updateMany({
        where: { stageId },
        data: { completed: true },
      });
      await this.prisma.progressEvent.create({
        data: { userId, type: 'STAGE_DONE', refId: stageId, hoursSpent: 2 },
      });
    }
    return this.get(userId, roadmapId);
  }

  async setSkillStatus(userId: string, roadmapId: string, stageSkillId: string, status: SkillStatus) {
    await this.owned(userId, roadmapId);
    const ss = await this.prisma.roadmapStageSkill.update({
      where: { id: stageSkillId },
      data: { status },
    });
    await this.recomputeAndSyncStage(ss.stageId);
    if (status === SkillStatus.DONE) {
      await this.prisma.progressEvent.create({
        data: { userId, type: 'SKILL_DONE', refId: stageSkillId, hoursSpent: 1 },
      });
    }
    return this.get(userId, roadmapId);
  }

  async toggleTask(userId: string, roadmapId: string, taskId: string) {
    await this.owned(userId, roadmapId);
    const task = await this.prisma.practicalTask.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    const updated = await this.prisma.practicalTask.update({
      where: { id: taskId },
      data: { completed: !task.completed },
    });
    await this.recomputeAndSyncStage(updated.stageId);
    if (updated.completed) {
      await this.prisma.progressEvent.create({
        data: { userId, type: 'TASK_DONE', refId: taskId, hoursSpent: 1.5 },
      });
    }
    return this.get(userId, roadmapId);
  }

  async addTask(userId: string, roadmapId: string, stageId: string, dto: AddTaskDto) {
    await this.owned(userId, roadmapId);
    await this.prisma.practicalTask.create({
      data: { stageId, title: dto.title, description: dto.description },
    });
    return this.get(userId, roadmapId);
  }

  async remove(userId: string, roadmapId: string) {
    await this.owned(userId, roadmapId);
    await this.prisma.roadmap.delete({ where: { id: roadmapId } });
    return { deleted: true };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { computeGraphCompletion } from '../roadmap/roadmap-graph.service';

/**
 * F5 profile hub: one aggregated read composing identity, career profile, the
 * latest psych result, roadmaps + completion, earned certificates and recent
 * activity — so the client makes a single call instead of five.
 */
@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(userId: string) {
    const [user, psych, roadmaps, certificates, recentEvents, counts] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { careerProfile: true, subscription: true },
      }),
      this.prisma.psychTestResult.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.roadmap.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          nodes: { select: { type: true, status: true } },
          stages: { select: { status: true } },
        },
      }),
      this.prisma.roadmapCertificate.findMany({
        where: { userId },
        orderBy: { issuedAt: 'desc' },
      }),
      this.prisma.progressEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.countsFor(userId),
    ]);

    const roadmapViews = roadmaps.map((r) => ({
      id: r.id,
      targetRole: r.targetRole,
      slug: r.slug,
      status: r.status,
      useGraph: r.useGraph,
      completion: r.useGraph
        ? computeGraphCompletion(r.nodes)
        : this.legacyCompletion(r.stages),
      updatedAt: r.updatedAt,
    }));
    const activeRoadmap =
      roadmapViews.find((r) => r.status === 'ACTIVE') ?? roadmapViews[0] ?? null;

    return {
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: user.plan,
            provider: user.provider,
            emailVerified: user.emailVerified,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
          }
        : null,
      careerProfile: user?.careerProfile
        ? {
            interests: user.careerProfile.interests,
            goals: user.careerProfile.goals,
            experienceLevel: user.careerProfile.experienceLevel,
            currentSkills: user.careerProfile.currentSkills,
            onboardingCompleted: user.careerProfile.onboardingCompleted,
          }
        : null,
      psychResult: psych
        ? { profileCode: psych.profileCode, axes: psych.axes, takenAt: psych.createdAt }
        : null,
      roadmaps: roadmapViews,
      activeRoadmap,
      certificates: certificates.map((c) => ({
        serial: c.serial,
        role: c.role,
        score: c.score,
        issuedAt: c.issuedAt,
        roadmapId: c.roadmapId,
        verifyToken: c.verifyToken,
      })),
      recentActivity: recentEvents.map((e) => ({
        type: e.type,
        createdAt: e.createdAt,
      })),
      stats: {
        roadmaps: counts.roadmaps,
        certificates: certificates.length,
        completedNodes: counts.completedNodes,
        chatSessions: counts.chatSessions,
        assessmentsPassed: counts.assessmentsPassed,
      },
    };
  }

  private async countsFor(userId: string) {
    const [roadmaps, completedNodes, chatSessions, assessmentsPassed] = await Promise.all([
      this.prisma.roadmap.count({ where: { userId } }),
      this.prisma.roadmapNode.count({ where: { roadmap: { userId }, status: 'DONE' } }),
      this.prisma.chatSession.count({ where: { userId } }),
      this.prisma.finalAssessmentAttempt.count({ where: { userId, status: 'PASSED' } }),
    ]);
    return { roadmaps, completedNodes, chatSessions, assessmentsPassed };
  }

  private legacyCompletion(stages: { status: string }[]): number {
    if (!stages.length) return 0;
    const done = stages.filter((s) => s.status === 'DONE').length;
    return Math.round((done / stages.length) * 100);
  }
}

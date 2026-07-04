import { Injectable } from '@nestjs/common';
import { CareerProfileDto, ExperienceLevel } from '@careeros/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class CareerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async getProfile(userId: string) {
    return this.prisma.careerProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async saveProfile(userId: string, dto: CareerProfileDto) {
    return this.prisma.careerProfile.upsert({
      where: { userId },
      update: {
        interests: dto.interests,
        goals: dto.goals,
        experienceLevel: dto.experienceLevel,
        currentSkills: dto.currentSkills,
        strengths: dto.strengths,
        weaknesses: dto.weaknesses,
        preferredWorkStyle: dto.preferredWorkStyle,
        onboardingCompleted: true,
      },
      create: {
        userId,
        interests: dto.interests,
        goals: dto.goals,
        experienceLevel: dto.experienceLevel,
        currentSkills: dto.currentSkills,
        strengths: dto.strengths,
        weaknesses: dto.weaknesses,
        preferredWorkStyle: dto.preferredWorkStyle,
        onboardingCompleted: true,
      },
    });
  }

  private profileForAi(profile: {
    interests: string[];
    goals: string;
    experienceLevel: ExperienceLevel;
    currentSkills: unknown;
    strengths: string;
    weaknesses: string;
  }) {
    return {
      interests: profile.interests,
      goals: profile.goals,
      experienceLevel: profile.experienceLevel,
      currentSkills: Array.isArray(profile.currentSkills)
        ? (profile.currentSkills as string[])
        : [],
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
    };
  }

  async generateRecommendations(userId: string, limit = 5) {
    const profile = await this.getProfile(userId);
    const recs = this.ai.recommendations(this.profileForAi(profile), limit);

    await this.prisma.careerRecommendation.deleteMany({ where: { userId } });
    await this.prisma.careerRecommendation.createMany({
      data: recs.map((r) => ({
        userId,
        title: r.title,
        reason: r.reason,
        entryDifficulty: r.entryDifficulty,
        estimatedMonths: r.estimatedMonths,
        score: r.score,
      })),
    });
    return this.prisma.careerRecommendation.findMany({
      where: { userId },
      orderBy: { score: 'desc' },
    });
  }

  async listRecommendations(userId: string) {
    return this.prisma.careerRecommendation.findMany({
      where: { userId },
      orderBy: { score: 'desc' },
    });
  }

  async skillGaps(userId: string) {
    const profile = await this.getProfile(userId);
    return this.ai.skillGaps(this.profileForAi(profile));
  }
}

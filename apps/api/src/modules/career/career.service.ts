import { Injectable, Logger } from '@nestjs/common';
import { CareerProfileDto, ExperienceLevel } from '@careeros/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { matchProfessions, PsychAxes } from '../psych-test/psych-test.util';
import { AXIS_LABELS, REASON_TEMPLATES, RiasecAxis } from '../psych-test/riasec.data';

type Locale = 'en' | 'ru' | 'uz';

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

  private readonly logger = new Logger('CareerService');

  /**
   * F1: when a psych-test result exists, recommendations come from the
   * deterministic axis→profession map (identical profile → identical list),
   * with reasons enriched by the LLM when one is configured (mock-safe).
   */
  async generateRecommendations(userId: string, limit = 5, locale: Locale = 'en') {
    const psych = await this.prisma.psychTestResult.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const recs = psych
      ? await this.psychRecommendations(psych.axes as PsychAxes, psych.profileCode, limit, locale)
      : this.ai.recommendations(this.profileForAi(await this.getProfile(userId)), limit);

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

  private async psychRecommendations(
    axes: PsychAxes,
    profileCode: string,
    limit: number,
    locale: Locale,
  ) {
    const matches = matchProfessions(axes, limit);
    const axisNames = profileCode
      .split('')
      .map((letter) => AXIS_LABELS[letter as RiasecAxis]?.[locale] ?? letter)
      .join(' + ');
    const base = matches.map((m) => ({
      title: m.title,
      reason: REASON_TEMPLATES[locale](axisNames, m.blurb[locale]),
      entryDifficulty: m.entryDifficulty,
      estimatedMonths: m.estimatedMonths,
      score: m.matchScore,
    }));

    // LLM enrichment of the reason texts only — ranking stays deterministic.
    if (this.ai.providerName !== 'mock') {
      try {
        const { text } = await this.ai.chatWith(
          [
            {
              role: 'system',
              content: `You improve career recommendation explanations. Reply ONLY with JSON: {"reasons": string[]} — one vivid, personal sentence per profession, in locale "${locale}". Keep the same order.`,
            },
            {
              role: 'user',
              content: JSON.stringify({
                riasecProfile: profileCode,
                axes,
                professions: base.map((r) => ({ title: r.title, draft: r.reason })),
              }),
            },
          ],
          { json: true, temperature: 0.4 },
        );
        const parsed = JSON.parse(text) as { reasons?: unknown };
        if (Array.isArray(parsed.reasons) && parsed.reasons.length === base.length) {
          return base.map((r, i) =>
            typeof parsed.reasons![i] === 'string' && (parsed.reasons![i] as string).length > 20
              ? { ...r, reason: parsed.reasons![i] as string }
              : r,
          );
        }
      } catch (err) {
        this.logger.debug(`LLM reason enrichment skipped: ${(err as Error).message}`);
      }
    }
    return base;
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

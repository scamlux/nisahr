import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  AiCareerRecommendation,
  AiRoadmap,
  CareerStructuredPayload,
  ExperienceLevel,
} from '@careeros/shared';
import { LLM_PROVIDER, LlmMessage, LlmProvider } from './llm-provider.interface';
import { pickTemplate } from './roadmap-templates';

interface ProfileLike {
  interests?: string[];
  goals?: string;
  experienceLevel?: ExperienceLevel;
  currentSkills?: string[];
  strengths?: string;
  weaknesses?: string;
}

const CONSULTANT_SYSTEM = `You are CareerOS, a world-class AI HR and career consultant.
You help students, juniors and career switchers (18-35) decide what to become and how to get there.
Be concrete, encouraging and specific. Recommend roles, name concrete skill gaps, and suggest next steps.`;

@Injectable()
export class AiService {
  private readonly logger = new Logger('AiService');

  constructor(@Inject(LLM_PROVIDER) private readonly llm: LlmProvider) {}

  get providerName() {
    return this.llm.name;
  }

  /** AI-HR chat: natural text + structured recommendations / skill gaps. */
  async consult(
    profile: ProfileLike,
    history: LlmMessage[],
  ): Promise<{ text: string; structuredPayload: CareerStructuredPayload }> {
    const messages: LlmMessage[] = [
      { role: 'system', content: CONSULTANT_SYSTEM },
      {
        role: 'system',
        content: `User profile: ${JSON.stringify({
          interests: profile.interests ?? [],
          experienceLevel: profile.experienceLevel ?? 'BEGINNER',
          currentSkills: profile.currentSkills ?? [],
          goals: profile.goals ?? '',
        })}`,
      },
      ...history,
    ];

    let text: string;
    try {
      text = await this.llm.chat(messages, { temperature: 0.7 });
    } catch (err) {
      this.logger.warn(`LLM chat failed, using fallback: ${(err as Error).message}`);
      text =
        "Here's how I'd approach your next step: pick one target role, close your two biggest skill gaps with hands-on projects, and practice interviews weekly.";
    }

    const recommendations = this.recommendations(profile, 3);
    const structuredPayload: CareerStructuredPayload = {
      recommendations,
      skillGaps: this.skillGaps(profile),
      summary: `Top match: ${recommendations[0]?.title ?? 'Explore roles'}`,
    };
    return { text, structuredPayload };
  }

  /** Ranked career recommendations from a profile (deterministic + plausible). */
  recommendations(profile: ProfileLike, limit = 5): AiCareerRecommendation[] {
    const interests = (profile.interests ?? []).map((s) => s.toLowerCase());
    const skills = (profile.currentSkills ?? []).map((s) => s.toLowerCase());
    const corpus = [...interests, ...skills, (profile.goals ?? '').toLowerCase()].join(' ');

    const catalog: { title: string; signals: string[]; months: number; diff: 'LOW' | 'MEDIUM' | 'HIGH'; base: number }[] = [
      { title: 'Frontend Developer', signals: ['design', 'web', 'react', 'ui', 'creative', 'javascript'], months: 6, diff: 'LOW', base: 72 },
      { title: 'Backend Developer', signals: ['logic', 'api', 'data', 'systems', 'node', 'java', 'python'], months: 8, diff: 'MEDIUM', base: 70 },
      { title: 'Product Manager', signals: ['business', 'people', 'strategy', 'communication', 'leadership'], months: 7, diff: 'MEDIUM', base: 66 },
      { title: 'UI/UX Designer', signals: ['design', 'creative', 'art', 'figma', 'user'], months: 6, diff: 'LOW', base: 68 },
      { title: 'Data Analyst', signals: ['data', 'math', 'excel', 'sql', 'analytics', 'numbers'], months: 6, diff: 'LOW', base: 71 },
      { title: 'QA Engineer', signals: ['detail', 'testing', 'quality', 'process'], months: 4, diff: 'LOW', base: 64 },
      { title: 'AI Engineer', signals: ['ai', 'ml', 'math', 'python', 'research', 'data'], months: 12, diff: 'HIGH', base: 75 },
    ];

    const scored = catalog
      .map((c) => {
        const hits = c.signals.filter((s) => corpus.includes(s)).length;
        const score = Math.min(98, c.base + hits * 6);
        return {
          title: c.title,
          reason:
            hits > 0
              ? `Matches your interests in ${c.signals.filter((s) => corpus.includes(s)).join(', ')}. Strong growth and entry paths.`
              : `A solid, in-demand path with clear entry steps that fits a ${profile.experienceLevel ?? 'BEGINNER'} starting point.`,
          entryDifficulty: c.diff,
          estimatedMonths: c.months,
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  skillGaps(profile: ProfileLike): string[] {
    const have = new Set((profile.currentSkills ?? []).map((s) => s.toLowerCase()));
    const top = this.recommendations(profile, 1)[0];
    const tmpl = pickTemplate(top?.title ?? 'Frontend Developer');
    const needed = tmpl.stages.flatMap((s) => s.skills.map((sk) => sk.name));
    return needed.filter((n) => !have.has(n.toLowerCase())).slice(0, 8);
  }

  /**
   * Personalized roadmap. Adapts the closest standard template to the user's
   * level and weekly hours. The same path is used as AI fallback so the app
   * never hard-fails without credentials.
   */
  async generateRoadmap(
    targetRole: string,
    level: ExperienceLevel,
    weeklyHours: number,
    _profile?: ProfileLike,
  ): Promise<AiRoadmap> {
    const tmpl = pickTemplate(targetRole);
    // Scale estimated weeks by weekly hours (10h baseline) and experience.
    const levelFactor: Record<string, number> = {
      BEGINNER: 1, JUNIOR: 0.85, MID: 0.7, SENIOR: 0.55,
    };
    const hoursFactor = Math.max(0.5, Math.min(2, 10 / Math.max(1, weeklyHours)));
    const estimatedWeeks = Math.max(
      4,
      Math.round(tmpl.estimatedWeeks * hoursFactor * (levelFactor[level] ?? 1)),
    );

    return {
      targetRole: targetRole || tmpl.targetRole,
      level,
      estimatedWeeks,
      stages: tmpl.stages.map((s) => ({ ...s })),
    };
  }

  /** Resume review: score + strengths/gaps/suggestions from parsed text. */
  reviewResume(text: string, targetRole = 'your target role') {
    const lc = text.toLowerCase();
    const len = text.trim().length;
    const has = (w: string) => lc.includes(w);

    const strengths: string[] = [];
    const gaps: string[] = [];
    const suggestions: string[] = [];

    if (has('project')) strengths.push('Shows hands-on projects');
    else gaps.push('No clear projects — add 2-3 with impact and links');

    if (/\d+%|\d+\s?(users|customers|x)/.test(lc)) strengths.push('Includes quantified results');
    else suggestions.push('Quantify achievements (e.g. "cut load time 40%")');

    if (has('github') || has('portfolio')) strengths.push('Links to portfolio/GitHub');
    else suggestions.push('Add a GitHub and portfolio link near the top');

    if (len < 400) gaps.push('Resume is thin — expand experience and skills');
    if (!has('education') && !has('university') && !has('bootcamp'))
      suggestions.push('Add an education or training section');

    if (!has(targetRole.toLowerCase().split(' ')[0]))
      suggestions.push(`Tailor the summary toward "${targetRole}"`);

    const base = 55;
    const score = Math.max(
      20,
      Math.min(95, base + strengths.length * 9 - gaps.length * 8 + (len > 800 ? 6 : 0)),
    );

    if (strengths.length === 0) strengths.push('Clear, readable formatting');
    return { score, strengths, gaps, suggestions };
  }

  /** Next interview question for a turn-based mock interview. */
  interviewQuestions(type: string, targetRole: string): string[] {
    const common = [
      `Tell me about yourself and why ${targetRole} interests you.`,
      'Walk me through a project you are proud of.',
      'Describe a time you faced a hard problem. How did you solve it?',
      'What is a recent thing you learned, and how did you learn it?',
      'Where do you see yourself growing in this role over the next year?',
    ];
    const technical = [
      `What core skills do you think a ${targetRole} must master first?`,
      'Explain a technical concept you know well to a non-expert.',
      'How would you debug something that "works on my machine" but fails in production?',
    ];
    const behavioral = [
      'Tell me about a conflict on a team and how you handled it.',
      'Describe a time you failed. What did you change afterwards?',
      'How do you prioritize when everything feels urgent?',
    ];
    if (type === 'TECHNICAL') return [...technical, ...common].slice(0, 5);
    if (type === 'BEHAVIORAL') return [...behavioral, ...common].slice(0, 5);
    return common;
  }

  /** Evaluate a single interview answer. */
  evaluateAnswer(answer: string): { score: number; feedback: string } {
    const len = answer.trim().length;
    const hasStructure = /(first|then|finally|because|result|impact|i )/i.test(answer);
    const hasMetric = /\d/.test(answer);
    let score = 40;
    if (len > 120) score += 25;
    if (hasStructure) score += 20;
    if (hasMetric) score += 15;
    score = Math.min(98, score);
    const feedback =
      score >= 80
        ? 'Strong, structured answer with concrete detail. Keep using the situation→action→result shape.'
        : score >= 60
          ? 'Good direction. Add a concrete example and a measurable outcome to make it land.'
          : 'Too brief or vague. Use a real example, explain your actions, and end with the result.';
    return { score, feedback };
  }

  /** AI learning insights for the analytics dashboard. */
  insights(stats: {
    streakDays: number;
    weeklyHours: number;
    roadmapCompletion: number;
    completedSkills: number;
  }): { productivity: string; pace: string; growthZones: string[]; motivationRisk: string; weeklySummary: string } {
    const motivationRisk =
      stats.streakDays === 0 ? 'HIGH' : stats.streakDays < 3 ? 'MEDIUM' : 'LOW';
    const pace =
      stats.weeklyHours >= 10 ? 'Ahead of schedule' : stats.weeklyHours >= 4 ? 'On track' : 'Falling behind';
    return {
      productivity: `You logged ~${stats.weeklyHours}h this week across ${stats.completedSkills} completed skills.`,
      pace,
      growthZones:
        stats.roadmapCompletion < 50
          ? ['Maintain a daily streak', 'Finish your current stage', 'Add one project this week']
          : ['Start interview prep', 'Polish your portfolio', 'Begin applying to roles'],
      motivationRisk,
      weeklySummary:
        motivationRisk === 'HIGH'
          ? 'You went quiet — a 15-minute session today restarts your momentum.'
          : `Nice consistency (${stats.streakDays}-day streak). Keep the chain alive and you’ll hit your next milestone soon.`,
    };
  }
}

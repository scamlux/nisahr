import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  AiCareerRecommendation,
  AiRoadmap,
  CareerStructuredPayload,
  ExperienceLevel,
} from '@careeros/shared';

/** Intent detected by the AI-HR router → which web-search tool to fire. */
type ToolIntent =
  | { tool: 'searchJobs'; role: string; location?: string }
  | { tool: 'searchResources'; topic: string }
  | { tool: 'getInterviewPrep'; role: string }
  | null;

const ROLE_KEYWORDS: Record<string, string> = {
  frontend: 'Frontend Developer',
  'front-end': 'Frontend Developer',
  'front end': 'Frontend Developer',
  backend: 'Backend Developer',
  'back-end': 'Backend Developer',
  'back end': 'Backend Developer',
  fullstack: 'Full-Stack Developer',
  'full-stack': 'Full-Stack Developer',
  'full stack': 'Full-Stack Developer',
  'data analyst': 'Data Analyst',
  'data scientist': 'Data Scientist',
  'data engineer': 'Data Engineer',
  'ai engineer': 'AI Engineer',
  'ml engineer': 'ML Engineer',
  'machine learning': 'ML Engineer',
  'ui/ux': 'UI/UX Designer',
  'ux designer': 'UI/UX Designer',
  'ui designer': 'UI/UX Designer',
  designer: 'UI/UX Designer',
  'qa engineer': 'QA Engineer',
  'qa ': 'QA Engineer',
  tester: 'QA Engineer',
  'product manager': 'Product Manager',
  devops: 'DevOps Engineer',
  mobile: 'Mobile Developer',
  developer: 'Software Developer',
  engineer: 'Software Engineer',
};
import { LLM_PROVIDER, LlmMessage, LlmProvider } from './llm-provider.interface';
import { AiRegistryService } from './ai-registry.service';
import { pickTemplate } from './roadmap-templates';
import { SearchToolsService } from '../search/search-tools.service';

export interface AiCallOptions {
  provider?: string;
  model?: string;
}

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

  constructor(
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
    private readonly registry: AiRegistryService,
    private readonly searchTools: SearchToolsService,
  ) {}

  get providerName() {
    return this.llm.name;
  }

  /**
   * Chat through the registry with per-request provider/model choice.
   * Unavailable providers fall back to the env default, then mock.
   */
  async chatWith(
    messages: LlmMessage[],
    opts?: AiCallOptions & { temperature?: number; maxTokens?: number; json?: boolean },
  ): Promise<{ text: string; provider: string; model: string }> {
    const provider = this.registry.resolve(opts?.provider);
    // Only honor the requested model if we actually got the requested provider —
    // on fallback (missing key) the model must follow the resolved provider.
    const requestedHonored =
      !opts?.provider || provider.name === opts.provider.toLowerCase();
    const model =
      requestedHonored && opts?.model
        ? opts.model
        : this.registry.defaultModelFor(provider.name);
    const text = await provider.chat(messages, {
      temperature: opts?.temperature,
      maxTokens: opts?.maxTokens,
      json: opts?.json,
      model,
    });
    return { text, provider: provider.name, model };
  }

  /** AI-HR chat: natural text + structured recommendations / skill gaps + live tool results. */
  async consult(
    profile: ProfileLike,
    history: LlmMessage[],
    opts?: AiCallOptions,
  ): Promise<{
    text: string;
    structuredPayload: CareerStructuredPayload;
    meta: { provider: string; model: string };
  }> {
    const lastUser = [...history].reverse().find((m) => m.role === 'user')?.content ?? '';
    // Intent router: fire a web-search tool when the user asks for jobs,
    // learning resources, or interview prep. Works on every provider (incl.
    // the zero-key mock) because detection + tool calls are provider-agnostic.
    const intent = this.detectIntent(lastUser, profile);
    const toolPayload = intent ? await this.runTool(intent) : {};

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
    ];
    if (intent) {
      messages.push({
        role: 'system',
        content: `You just used the "${intent.tool}" web-search tool. Ground your reply in these live results and reference them naturally (do not invent others):\n${JSON.stringify(
          toolPayload,
        ).slice(0, 3500)}`,
      });
    }
    messages.push(...history);

    let text: string;
    let meta = { provider: 'mock', model: 'careeros-mock' };
    try {
      const result = await this.chatWith(messages, { ...opts, temperature: 0.7 });
      text = result.text;
      meta = { provider: result.provider, model: result.model };
    } catch (err) {
      this.logger.warn(`LLM chat failed, using fallback: ${(err as Error).message}`);
      text = this.toolFallbackText(intent, toolPayload);
    }

    const recommendations = this.recommendations(profile, 3);
    const structuredPayload: CareerStructuredPayload = {
      recommendations,
      skillGaps: this.skillGaps(profile),
      summary: `Top match: ${recommendations[0]?.title ?? 'Explore roles'}`,
      ...toolPayload,
    };
    return { text, structuredPayload, meta };
  }

  /** Detect a web-search tool intent from the latest user message. */
  detectIntent(message: string, profile?: ProfileLike): ToolIntent {
    const t = message.toLowerCase();
    if (!t.trim()) return null;

    const jobRe = /\b(job|jobs|hiring|vacanc|opening|position|apply|роль|работ|ваканси|ish\b|ishga)\b/;
    const interviewRe = /\b(interview|интервью|собеседован|suhbat|intervyu)\b/;
    const resourceRe = /\b(learn|study|resource|course|tutorial|how do i|how to|guide|roadmap to|выучить|изучить|курс|материал|o'rgan|o‘rgan)\b/;

    const role = this.extractRole(message) ?? this.profileRole(profile);

    if (interviewRe.test(t)) return { tool: 'getInterviewPrep', role };
    if (jobRe.test(t)) return { tool: 'searchJobs', role, location: this.extractLocation(message) };
    if (resourceRe.test(t)) return { tool: 'searchResources', topic: this.extractTopic(message, role) };
    return null;
  }

  private async runTool(intent: NonNullable<ToolIntent>): Promise<CareerStructuredPayload> {
    try {
      if (intent.tool === 'searchJobs') {
        return { tool: 'searchJobs', jobs: await this.searchTools.searchJobs(intent.role, intent.location) };
      }
      if (intent.tool === 'searchResources') {
        return { tool: 'searchResources', resources: await this.searchTools.searchResources(intent.topic) };
      }
      const questions = this.interviewQuestions('HR', intent.role);
      return { tool: 'getInterviewPrep', interviewPrep: await this.searchTools.getInterviewPrep(intent.role, questions) };
    } catch (err) {
      this.logger.warn(`tool ${intent.tool} failed: ${(err as Error).message}`);
      return {};
    }
  }

  private extractRole(message: string): string | undefined {
    const t = message.toLowerCase();
    for (const [kw, role] of Object.entries(ROLE_KEYWORDS)) {
      if (t.includes(kw)) return role;
    }
    // "as a X" / "for a X" / "become a X"
    const m = t.match(/\b(?:as|for|become|a)\s+(?:an?\s+)?([a-z][a-z /+-]{2,30}?)\s*(?:role|job|position|developer|engineer|designer|analyst)?\b/);
    if (m?.[1]) return m[1].replace(/\b\w/g, (c) => c.toUpperCase()).trim();
    return undefined;
  }

  private profileRole(profile?: ProfileLike): string {
    return this.recommendations(profile ?? {}, 1)[0]?.title ?? 'Software Developer';
  }

  private extractLocation(message: string): string | undefined {
    const m = message.match(/\b(?:in|near|around)\s+([A-Z][a-zA-Z]+(?:[ ,]+[A-Z][a-zA-Z]+)?)/);
    if (m?.[1]) return m[1].trim();
    if (/\bremote\b/i.test(message)) return 'Remote';
    return undefined;
  }

  private extractTopic(message: string, role: string): string {
    const m = message
      .toLowerCase()
      .match(/\b(?:learn|study|about|master|understand)\s+([a-z][a-z0-9 .+/#-]{2,40})/);
    if (m?.[1]) return m[1].replace(/\b(please|now|today|quickly)\b/g, '').trim();
    return role;
  }

  private toolFallbackText(intent: ToolIntent, payload: CareerStructuredPayload): string {
    if (intent?.tool === 'searchJobs' && payload.jobs?.length)
      return `I found ${payload.jobs.length} openings for ${intent.role}. Here are the top matches — open any card to apply. Tailor your resume to each before applying.`;
    if (intent?.tool === 'searchResources' && payload.resources?.length)
      return `Here are ${payload.resources.length} strong resources to learn ${intent.topic}. Start with the first, then build a small project to lock it in.`;
    if (intent?.tool === 'getInterviewPrep' && payload.interviewPrep)
      return `Here's your interview prep for ${intent.role}: practice these questions out loud, focus on the listed areas, and review the linked resources.`;
    return "Here's how I'd approach your next step: pick one target role, close your two biggest skill gaps with hands-on projects, and practice interviews weekly.";
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

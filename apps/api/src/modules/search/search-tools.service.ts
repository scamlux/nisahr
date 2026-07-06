import { Injectable, Logger } from '@nestjs/common';
import { InterviewPrep, JobResult, WebResource } from '@careeros/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchRegistryService } from './search-registry.service';

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6h

/**
 * The three AI-HR tools (F3): searchJobs, searchResources, getInterviewPrep.
 * Results are cached in JobSearchCache keyed by tool+provider+normalized query
 * so repeat lookups are instant and friendly to provider quotas. Every path is
 * best-effort: a failing provider yields the mock's results, never an error.
 */
@Injectable()
export class SearchToolsService {
  private readonly logger = new Logger('SearchToolsService');

  constructor(
    private readonly registry: SearchRegistryService,
    private readonly prisma: PrismaService,
  ) {}

  private norm(s: string): string {
    return s.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  private async cached<T>(tool: string, query: string, produce: () => Promise<T>): Promise<T> {
    const provider = this.registry.activeProviderId;
    const key = this.norm(query);
    try {
      const hit = await this.prisma.jobSearchCache.findUnique({
        where: { tool_provider_query: { tool, provider, query: key } },
      });
      if (hit && hit.expiresAt > new Date()) return hit.results as T;
    } catch (err) {
      this.logger.warn(`cache read failed: ${(err as Error).message}`);
    }

    const results = await produce();

    try {
      const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
      await this.prisma.jobSearchCache.upsert({
        where: { tool_provider_query: { tool, provider, query: key } },
        create: { tool, provider, query: key, results: results as object, expiresAt },
        update: { results: results as object, expiresAt },
      });
    } catch (err) {
      this.logger.warn(`cache write failed: ${(err as Error).message}`);
    }
    return results;
  }

  async searchJobs(role: string, location?: string): Promise<JobResult[]> {
    return this.cached(`searchJobs`, `${role}|${location ?? ''}`, () =>
      this.registry.resolve().searchJobs({ role, location }),
    );
  }

  async searchResources(topic: string): Promise<WebResource[]> {
    return this.cached(`searchResources`, topic, () =>
      this.registry.resolve().searchResources({ topic }),
    );
  }

  /**
   * Interview prep bundle. Composes deterministic question sets (passed in from
   * AiService.interviewQuestions so we reuse the existing interview logic) with
   * live resource search — not a parallel interview engine.
   */
  async getInterviewPrep(role: string, questions: string[]): Promise<InterviewPrep> {
    const resources = await this.searchResources(`${role} interview questions prep`);
    return {
      role,
      questions,
      focusAreas: this.focusAreas(role),
      resources: resources.slice(0, 4),
    };
  }

  private focusAreas(role: string): string[] {
    const r = role.toLowerCase();
    if (r.includes('front')) return ['JavaScript & TypeScript', 'React internals', 'CSS & accessibility', 'System design (frontend)'];
    if (r.includes('back')) return ['Data structures', 'API & database design', 'Concurrency', 'System design'];
    if (r.includes('data')) return ['SQL', 'Statistics', 'Data storytelling', 'Python/pandas'];
    if (r.includes('ai') || r.includes('ml')) return ['ML fundamentals', 'Python', 'Model evaluation', 'LLM/prompting'];
    if (r.includes('design') || r.includes('ux')) return ['Design process', 'Portfolio walkthrough', 'Usability heuristics', 'Figma craft'];
    if (r.includes('qa') || r.includes('test')) return ['Test design', 'Automation', 'Bug reporting', 'CI/CD'];
    return ['Communication', 'Problem solving', 'Behavioral (STAR)', 'Role fundamentals'];
  }
}

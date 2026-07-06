import { Logger } from '@nestjs/common';
import { JobResult, WebResource } from '@careeros/shared';
import { JobQuery, ResourceQuery, SearchProvider } from '../search-provider.interface';

export interface RawResult {
  title: string;
  url: string;
  content: string;
  source: string;
}

/**
 * Shared base for real web-search providers (Tavily / Brave / SearXNG). Each
 * subclass only implements the raw HTTP call; job/resource shaping is common.
 * Any network or parse failure returns [] so the registry/router can fall back
 * to mock rather than hard-fail.
 */
export abstract class HttpSearchProvider implements SearchProvider {
  protected readonly logger = new Logger(this.constructor.name);
  abstract readonly name: string;
  abstract readonly available: boolean;

  protected abstract rawSearch(query: string, limit: number): Promise<RawResult[]>;

  async searchJobs(query: JobQuery): Promise<JobResult[]> {
    const limit = Math.min(Math.max(query.limit ?? 6, 1), 10);
    const q = `${query.role} jobs${query.location ? ' in ' + query.location : ''} hiring apply`;
    const raw = await this.safe(q, limit);
    return raw.map((r) => ({
      title: r.title.split(/[-|–—]/)[0].trim() || query.role,
      company: this.hostname(r.url),
      location: query.location?.trim() || 'See listing',
      workMode: /remote/i.test(r.title + r.content) ? 'Remote' : undefined,
      tags: [],
      url: r.url,
      source: r.source,
    }));
  }

  async searchResources(query: ResourceQuery): Promise<WebResource[]> {
    const limit = Math.min(Math.max(query.limit ?? 5, 1), 8);
    const raw = await this.safe(`${query.topic} tutorial guide learn`, limit);
    return raw.map((r) => ({
      title: r.title.trim(),
      url: r.url,
      source: r.source,
      snippet: r.content.slice(0, 200),
      kind: this.classify(r.url),
    }));
  }

  private async safe(query: string, limit: number): Promise<RawResult[]> {
    try {
      return await this.rawSearch(query, limit);
    } catch (err) {
      this.logger.warn(`${this.name} search failed: ${(err as Error).message}`);
      return [];
    }
  }

  protected hostname(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return this.name;
    }
  }
  private classify(url: string): WebResource['kind'] {
    if (/youtube\.com|vimeo\.com|youtu\.be/.test(url)) return 'VIDEO';
    if (/coursera|udemy|edx|pluralsight/.test(url)) return 'COURSE';
    if (/docs\.|developer\.|\/docs/.test(url)) return 'DOC';
    return 'ARTICLE';
  }
}

/** Tavily search API — https://tavily.com (TAVILY_API_KEY). */
export class TavilySearchProvider extends HttpSearchProvider {
  readonly name = 'tavily';
  private readonly apiKey = process.env.TAVILY_API_KEY ?? '';
  readonly available = this.apiKey.length > 0;

  protected async rawSearch(query: string, limit: number): Promise<RawResult[]> {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        max_results: limit,
        search_depth: 'basic',
      }),
    });
    if (!res.ok) throw new Error(`Tavily HTTP ${res.status}`);
    const data = (await res.json()) as { results?: Array<{ title: string; url: string; content: string }> };
    return (data.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content ?? '',
      source: this.hostname(r.url),
    }));
  }
}

/** Brave Search API — https://brave.com/search/api (BRAVE_API_KEY). */
export class BraveSearchProvider extends HttpSearchProvider {
  readonly name = 'brave';
  private readonly apiKey = process.env.BRAVE_API_KEY ?? '';
  readonly available = this.apiKey.length > 0;

  protected async rawSearch(query: string, limit: number): Promise<RawResult[]> {
    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.set('q', query);
    url.searchParams.set('count', String(limit));
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'X-Subscription-Token': this.apiKey },
    });
    if (!res.ok) throw new Error(`Brave HTTP ${res.status}`);
    const data = (await res.json()) as {
      web?: { results?: Array<{ title: string; url: string; description: string }> };
    };
    return (data.web?.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.description ?? '',
      source: this.hostname(r.url),
    }));
  }
}

/** Self-hosted SearXNG meta-search (SEARXNG_URL, e.g. https://searx.example.com). */
export class SearxngSearchProvider extends HttpSearchProvider {
  readonly name = 'searxng';
  private readonly baseUrl = process.env.SEARXNG_URL ?? '';
  readonly available = this.baseUrl.length > 0;

  protected async rawSearch(query: string, limit: number): Promise<RawResult[]> {
    const url = new URL('/search', this.baseUrl);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`SearXNG HTTP ${res.status}`);
    const data = (await res.json()) as {
      results?: Array<{ title: string; url: string; content: string }>;
    };
    return (data.results ?? []).slice(0, limit).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content ?? '',
      source: this.hostname(r.url),
    }));
  }
}

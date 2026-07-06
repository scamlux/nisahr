import { Injectable } from '@nestjs/common';
import { JobResult, WebResource } from '@careeros/shared';
import { JobQuery, ResourceQuery, SearchProvider } from '../search-provider.interface';

/**
 * Zero-key search provider. Produces deterministic, realistic-looking results so
 * the AI-HR chat works fully offline. Deterministic by (role/topic) — no RNG —
 * which keeps tests stable and lets JobSearchCache hits be meaningful.
 */
@Injectable()
export class MockSearchProvider implements SearchProvider {
  readonly name = 'mock';
  readonly available = true;

  private readonly companies = [
    'Nordic Labs', 'Brightpath', 'Corestack', 'Lumen Digital', 'Vela Systems',
    'Northwind', 'Fathom AI', 'Signal Works', 'Openframe', 'Kanso',
  ];
  private readonly cities = [
    'Remote', 'Tashkent, UZ', 'Berlin, DE', 'Warsaw, PL', 'Almaty, KZ', 'Remote (EU)',
  ];
  private readonly modes = ['Remote', 'Hybrid', 'On-site'];

  private hash(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  async searchJobs(query: JobQuery): Promise<JobResult[]> {
    const role = query.role.trim() || 'Software Engineer';
    const limit = Math.min(Math.max(query.limit ?? 6, 1), 10);
    const seniorities = ['Junior', 'Mid', '', 'Associate'];
    const skillPool = this.skillsFor(role);

    return Array.from({ length: limit }).map((_, i) => {
      const seed = this.hash(`${role}|${query.location ?? ''}|${i}`);
      const company = this.companies[seed % this.companies.length];
      const location = query.location?.trim() || this.cities[seed % this.cities.length];
      const seniority = seniorities[(seed >> 3) % seniorities.length];
      const base = 900 + ((seed >> 5) % 26) * 100; // 900–3400
      const salary = `$${base}–${base + 900}/mo`;
      const tags = [skillPool[seed % skillPool.length], skillPool[(seed >> 4) % skillPool.length]]
        .filter((v, idx, arr) => arr.indexOf(v) === idx);
      return {
        title: `${seniority ? seniority + ' ' : ''}${this.titleCase(role)}`.trim(),
        company,
        location,
        workMode: this.modes[(seed >> 7) % this.modes.length],
        salary,
        tags,
        url: `https://jobs.example.com/${this.slug(role)}-${company.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
        source: 'CareerOS Jobs',
        postedAt: `${1 + (seed % 20)}d ago`,
      } satisfies JobResult;
    });
  }

  async searchResources(query: ResourceQuery): Promise<WebResource[]> {
    const topic = query.topic.trim() || 'career growth';
    const limit = Math.min(Math.max(query.limit ?? 5, 1), 8);
    const t = this.titleCase(topic);
    const catalog = [
      { source: 'freeCodeCamp', base: 'https://www.freecodecamp.org/news', kind: 'ARTICLE' as const },
      { source: 'YouTube', base: 'https://www.youtube.com/results?search_query', kind: 'VIDEO' as const },
      { source: 'Coursera', base: 'https://www.coursera.org/search', kind: 'COURSE' as const },
      { source: 'MDN', base: 'https://developer.mozilla.org/en-US/docs', kind: 'DOC' as const },
      { source: 'roadmap.sh', base: 'https://roadmap.sh', kind: 'DOC' as const },
    ];
    return Array.from({ length: limit }).map((_, i) => {
      const seed = this.hash(`${topic}|${i}`);
      const c = catalog[seed % catalog.length];
      return {
        title: `${t}: ${['a practical guide', 'from scratch', 'crash course', 'best practices', 'in 2026'][i % 5]}`,
        url: `${c.base}=${this.slug(topic)}`,
        source: c.source,
        snippet: `A ${c.kind.toLowerCase()} covering ${t.toLowerCase()} with hands-on examples and a clear learning path.`,
        kind: c.kind,
      } satisfies WebResource;
    });
  }

  private skillsFor(role: string): string[] {
    const r = role.toLowerCase();
    if (r.includes('front')) return ['React', 'TypeScript', 'CSS', 'Next.js'];
    if (r.includes('back')) return ['Node.js', 'PostgreSQL', 'REST', 'Docker'];
    if (r.includes('data')) return ['SQL', 'Python', 'Pandas', 'Tableau'];
    if (r.includes('ai') || r.includes('ml')) return ['Python', 'PyTorch', 'LLMs', 'NumPy'];
    if (r.includes('design') || r.includes('ux')) return ['Figma', 'Prototyping', 'Research', 'Design systems'];
    if (r.includes('qa') || r.includes('test')) return ['Playwright', 'Jest', 'CI', 'Test design'];
    return ['Communication', 'Problem solving', 'Git', 'Agile'];
  }

  private titleCase(s: string): string {
    return s.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  private slug(s: string): string {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
}

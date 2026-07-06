import { MockSearchProvider } from './providers/mock-search.provider';
import { SearchRegistryService } from './search-registry.service';

describe('MockSearchProvider', () => {
  const p = new MockSearchProvider();

  it('is always available', () => {
    expect(p.available).toBe(true);
    expect(p.name).toBe('mock');
  });

  it('returns the requested number of jobs (clamped 1..10)', async () => {
    expect(await p.searchJobs({ role: 'Frontend Developer', limit: 6 })).toHaveLength(6);
    expect(await p.searchJobs({ role: 'x', limit: 99 })).toHaveLength(10);
    expect(await p.searchJobs({ role: 'x', limit: 0 })).toHaveLength(1);
  });

  it('is deterministic for the same query', async () => {
    const a = await p.searchJobs({ role: 'Backend Developer', location: 'Berlin' });
    const b = await p.searchJobs({ role: 'Backend Developer', location: 'Berlin' });
    expect(a).toEqual(b);
  });

  it('honours an explicit location', async () => {
    const jobs = await p.searchJobs({ role: 'Data Analyst', location: 'Tashkent' });
    expect(jobs.every((j) => j.location === 'Tashkent')).toBe(true);
  });

  it('produces valid job shape with a url and salary', async () => {
    const [job] = await p.searchJobs({ role: 'Frontend Developer' });
    expect(job.url).toMatch(/^https?:\/\//);
    expect(job.title.toLowerCase()).toContain('frontend');
    expect(job.salary).toMatch(/\$/);
    expect(Array.isArray(job.tags)).toBe(true);
  });

  it('classifies resources with matching source/kind', async () => {
    const res = await p.searchResources({ topic: 'SQL' });
    expect(res.length).toBeGreaterThan(0);
    for (const r of res) {
      expect(r.url).toMatch(/^https?:\/\//);
      if (r.source === 'YouTube') expect(r.kind).toBe('VIDEO');
      if (r.source === 'Coursera') expect(r.kind).toBe('COURSE');
    }
  });
});

describe('SearchRegistryService', () => {
  const OLD = process.env.SEARCH_PROVIDER;
  afterEach(() => {
    if (OLD === undefined) delete process.env.SEARCH_PROVIDER;
    else process.env.SEARCH_PROVIDER = OLD;
  });

  it('falls back to mock when the configured provider has no key', () => {
    process.env.SEARCH_PROVIDER = 'tavily'; // no TAVILY_API_KEY in test env
    const reg = new SearchRegistryService(new MockSearchProvider());
    expect(reg.activeProviderId).toBe('mock');
    expect(reg.resolve().name).toBe('mock');
  });

  it('falls back to mock for an unknown provider', () => {
    process.env.SEARCH_PROVIDER = 'does-not-exist';
    const reg = new SearchRegistryService(new MockSearchProvider());
    expect(reg.activeProviderId).toBe('mock');
  });

  it('lists all providers with availability in the catalog', () => {
    delete process.env.SEARCH_PROVIDER;
    const reg = new SearchRegistryService(new MockSearchProvider());
    const cat = reg.catalog();
    expect(cat.active).toBe('mock');
    expect(cat.providers.map((x) => x.id).sort()).toEqual(['brave', 'mock', 'searxng', 'tavily']);
    expect(cat.providers.find((x) => x.id === 'mock')?.available).toBe(true);
  });
});

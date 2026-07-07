import { AiService } from './ai.service';

/**
 * The intent router (AiService.detectIntent) is provider-agnostic and pure over
 * its inputs, so we exercise it directly with stubbed dependencies.
 */
describe('AiService.detectIntent', () => {
  const ai = new AiService(null as never, null as never, null as never);

  it('routes job queries to searchJobs and extracts role + location', () => {
    const intent = ai.detectIntent('Can you find me frontend developer jobs in Berlin?');
    expect(intent?.tool).toBe('searchJobs');
    if (intent?.tool === 'searchJobs') {
      expect(intent.role).toBe('Frontend Developer');
      expect(intent.location).toBe('Berlin');
    }
  });

  it('detects remote as a location', () => {
    const intent = ai.detectIntent('any remote backend jobs hiring now?');
    expect(intent?.tool).toBe('searchJobs');
    if (intent?.tool === 'searchJobs') expect(intent.location).toBe('Remote');
  });

  it('routes learning queries to searchResources', () => {
    const intent = ai.detectIntent('I want to learn SQL, any good resources?');
    expect(intent?.tool).toBe('searchResources');
    if (intent?.tool === 'searchResources') expect(intent.topic.toLowerCase()).toContain('sql');
  });

  it('routes interview queries to getInterviewPrep with the role', () => {
    const intent = ai.detectIntent('help me prepare for a backend developer interview');
    expect(intent?.tool).toBe('getInterviewPrep');
    if (intent?.tool === 'getInterviewPrep') expect(intent.role).toBe('Backend Developer');
  });

  it('prioritises interview intent over the job keyword', () => {
    // "position" would match jobs, but "interview" wins.
    const intent = ai.detectIntent('interview tips for a data analyst position');
    expect(intent?.tool).toBe('getInterviewPrep');
  });

  it('returns null for a general career question', () => {
    expect(ai.detectIntent('What should I become? I like design and helping people.')).toBeNull();
  });

  it('returns null for an empty message', () => {
    expect(ai.detectIntent('   ')).toBeNull();
  });

  it('falls back to a profile-derived role when none is named', () => {
    const intent = ai.detectIntent('show me some jobs', { interests: ['data', 'sql'] });
    expect(intent?.tool).toBe('searchJobs');
    if (intent?.tool === 'searchJobs') expect(intent.role).toBeTruthy();
  });
});

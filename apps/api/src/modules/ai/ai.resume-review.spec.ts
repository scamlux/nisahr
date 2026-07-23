import { AiService } from './ai.service';
import { resumeReviewV2Schema } from './ai-schemas';

/**
 * AiService.reviewResume with a mocked LlmProvider (no OPENAI_API_KEY needed):
 * valid JSON is parsed to the v2 shape, garbage output and an unavailable
 * provider both fall back to the deterministic heuristic — which must emit the
 * exact same v2 contract.
 */

const VALID_V2 = {
  overall_score: 82,
  strengths: ['Strong project section with measurable impact'],
  weaknesses: ['No summary tailored to the role'],
  missing_keywords: ['TypeScript', 'React'],
  rewrite_suggestions: ['Lead each bullet with an action verb and a metric'],
};

const RESUME_TEXT =
  'Experienced developer. Built a project dashboard used by 500 users. ' +
  'GitHub: github.com/dev. Education: State University, BSc.';

function makeAi(opts: { available: boolean; reply?: string }) {
  const fakeLlm = {
    name: 'openai',
    available: opts.available,
    chat: jest.fn().mockResolvedValue(opts.reply ?? ''),
  };
  const fakeRegistry = {
    resolve: () => fakeLlm,
    defaultModelFor: () => 'gpt-4o-mini',
  };
  const ai = new AiService(fakeLlm as never, fakeRegistry as never, null as never);
  return { ai, fakeLlm };
}

describe('AiService.reviewResume (mocked LlmProvider)', () => {
  it('parses valid GPT JSON into the v2 result', async () => {
    const { ai, fakeLlm } = makeAi({ available: true, reply: JSON.stringify(VALID_V2) });
    const result = await ai.reviewResume(RESUME_TEXT, 'Frontend Developer');
    expect(result).toEqual(VALID_V2);
    expect(fakeLlm.chat).toHaveBeenCalledTimes(1);
    // json mode + role/resume in the user prompt
    const [messages, options] = fakeLlm.chat.mock.calls[0];
    expect(options.json).toBe(true);
    expect(messages[1].content).toContain('Frontend Developer');
    expect(messages[1].content).toContain('project dashboard');
  });

  it('falls back to the heuristic when GPT returns garbage', async () => {
    const { ai } = makeAi({ available: true, reply: 'not json at all {' });
    const result = await ai.reviewResume(RESUME_TEXT, 'Frontend Developer');
    expect(() => resumeReviewV2Schema.parse(result)).not.toThrow();
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('falls back to the heuristic when the schema rejects the JSON', async () => {
    const { ai } = makeAi({
      available: true,
      reply: JSON.stringify({ overall_score: 999, strengths: [] }),
    });
    const result = await ai.reviewResume(RESUME_TEXT, 'Frontend Developer');
    expect(result.overall_score).toBeLessThanOrEqual(100);
    expect(() => resumeReviewV2Schema.parse(result)).not.toThrow();
  });

  it('falls back without calling the LLM when the provider is unavailable', async () => {
    const { ai, fakeLlm } = makeAi({ available: false });
    const result = await ai.reviewResume(RESUME_TEXT, 'Frontend Developer');
    expect(fakeLlm.chat).not.toHaveBeenCalled();
    expect(() => resumeReviewV2Schema.parse(result)).not.toThrow();
  });

  it('heuristic fallback emits missing_keywords from the role template', async () => {
    const { ai } = makeAi({ available: false });
    const result = await ai.reviewResume(RESUME_TEXT, 'Frontend Developer');
    // The resume never mentions React/CSS/HTML — template skills must surface.
    expect(result.missing_keywords.length).toBeGreaterThan(0);
    expect(result.missing_keywords.length).toBeLessThanOrEqual(15);
    expect(result.missing_keywords).toContain('React');
    // Skills present in the text must not be reported as missing.
    const lower = result.missing_keywords.map((k) => k.toLowerCase());
    expect(lower).not.toContain('github');
  });

  it('heuristic scores a thin resume lower than a solid one', async () => {
    const { ai } = makeAi({ available: false });
    const thin = await ai.reviewResume('plain text', 'Frontend Developer');
    const solid = await ai.reviewResume(RESUME_TEXT, 'Frontend Developer');
    expect(solid.overall_score).toBeGreaterThan(thin.overall_score);
    expect(thin.weaknesses).toEqual(
      expect.arrayContaining([expect.stringContaining('thin')]),
    );
  });
});

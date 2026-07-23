import { BadRequestException } from '@nestjs/common';
import { resumeReviewRequestSchema } from '@careeros/shared';
import { ResumeService } from './resume.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

/**
 * ResumeService with mocked Prisma + AiService: text extraction (the reusable
 * in-memory upload parsing), the v2 -> ResumeReview column mapping, and the
 * superset response contract. Plus the shared request schema via the pipe.
 */

const V2_RESULT = {
  overall_score: 77,
  strengths: ['Hands-on projects'],
  weaknesses: ['No metrics'],
  missing_keywords: ['React', 'CSS'],
  rewrite_suggestions: ['Quantify achievements'],
};

function makeService() {
  const prisma = {
    resumeReview: {
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => ({
        id: 'rev-1',
        createdAt: new Date('2026-01-01'),
        ...data,
      })),
      findMany: jest.fn(async () => []),
    },
  };
  const ai = { reviewResume: jest.fn(async () => ({ ...V2_RESULT })) };
  const service = new ResumeService(prisma as never, ai as never);
  return { service, prisma, ai };
}

function fakeFile(content: string | Buffer, mimetype: string): Express.Multer.File {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
  return { buffer, mimetype, originalname: 'resume.bin' } as Express.Multer.File;
}

describe('ResumeService.extractText', () => {
  const { service } = makeService();

  it('prefers raw text over the uploaded file', () => {
    const file = fakeFile('file body', 'text/plain');
    expect(service.extractText(file, 'pasted resume')).toBe('pasted resume');
  });

  it('decodes text/* files as utf8', () => {
    const file = fakeFile('Plain text resume — utf8 ✓', 'text/plain');
    expect(service.extractText(file)).toBe('Plain text resume — utf8 ✓');
  });

  it('scrapes printable ASCII runs from binary buffers', () => {
    const binary = Buffer.concat([
      Buffer.from([0x00, 0x01, 0x02]),
      Buffer.from('Senior Frontend Developer', 'latin1'),
      Buffer.from([0xff, 0xfe]),
      Buffer.from('React and TypeScript', 'latin1'),
      Buffer.from([0x03]),
    ]);
    const text = service.extractText(fakeFile(binary, 'application/pdf'));
    expect(text).toContain('Senior Frontend Developer');
    expect(text).toContain('React and TypeScript');
  });

  it('throws BadRequestException when neither file nor text is given', () => {
    expect(() => service.extractText(undefined, '   ')).toThrow(BadRequestException);
  });
});

describe('ResumeService.review', () => {
  it('maps the v2 result onto ResumeReview columns and returns a superset', async () => {
    const { service, prisma, ai } = makeService();
    const result = await service.review('user-1', undefined, 'my resume text', 'Frontend Developer');

    expect(ai.reviewResume).toHaveBeenCalledWith('my resume text', 'Frontend Developer');
    expect(prisma.resumeReview.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        fileUrl: '',
        parsedText: 'my resume text',
        score: V2_RESULT.overall_score,
        strengths: V2_RESULT.strengths,
        gaps: V2_RESULT.weaknesses,
        suggestions: V2_RESULT.rewrite_suggestions,
      },
    });
    // Legacy persisted fields (the /career tab contract)…
    expect(result.score).toBe(77);
    expect(result.gaps).toEqual(['No metrics']);
    expect(result.suggestions).toEqual(['Quantify achievements']);
    // …plus the new v2 keys (the /resume-review page contract).
    expect(result.overall_score).toBe(77);
    expect(result.weaknesses).toEqual(['No metrics']);
    expect(result.missing_keywords).toEqual(['React', 'CSS']);
    expect(result.rewrite_suggestions).toEqual(['Quantify achievements']);
  });

  it('stores the original file name and truncates parsedText to 8000 chars', async () => {
    const { service, prisma } = makeService();
    const long = 'x'.repeat(9000);
    await service.review('user-1', fakeFile(long, 'text/plain'), undefined, 'QA Engineer');
    const { data } = prisma.resumeReview.create.mock.calls[0][0];
    expect(data.fileUrl).toBe('resume.bin');
    expect((data.parsedText as string).length).toBe(8000);
  });
});

describe('resumeReviewRequestSchema via ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(resumeReviewRequestSchema);

  it('accepts multipart string fields and applies the targetRole default', () => {
    expect(pipe.transform({ text: '  my resume  ' })).toEqual({
      text: 'my resume',
      targetRole: 'your target role',
    });
  });

  it('accepts a file-only body (no text)', () => {
    expect(pipe.transform({ targetRole: 'QA Engineer' })).toEqual({ targetRole: 'QA Engineer' });
  });

  it('rejects an over-long targetRole', () => {
    expect(() => pipe.transform({ targetRole: 'x'.repeat(81) })).toThrow(BadRequestException);
  });

  it('rejects text above 20000 chars', () => {
    expect(() => pipe.transform({ text: 'x'.repeat(20001) })).toThrow(BadRequestException);
  });

  it('strips unknown form fields', () => {
    expect(pipe.transform({ targetRole: 'QA Engineer', extra: 'field' })).toEqual({
      targetRole: 'QA Engineer',
    });
  });
});

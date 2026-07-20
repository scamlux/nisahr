import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ResumeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  /**
   * Best-effort text extraction without native deps: plain text is used as-is,
   * pdf/docx buffers fall back to scraping printable ASCII runs (enough for the
   * heuristic scorer). A raw `text` field always wins if provided.
   */
  extractText(file?: Express.Multer.File, rawText?: string): string {
    if (rawText && rawText.trim().length > 0) return rawText;
    if (!file) throw new BadRequestException('Provide a resume file or text');

    const buf = file.buffer;
    if (file.mimetype.startsWith('text/')) return buf.toString('utf8');

    // Scrape readable runs from binary documents.
    const ascii = buf.toString('latin1');
    const runs = ascii.match(/[\x20-\x7E]{4,}/g) ?? [];
    const text = runs.join(' ').replace(/\s+/g, ' ').trim();
    return text.slice(0, 20000);
  }

  async review(
    userId: string,
    file: Express.Multer.File | undefined,
    rawText: string | undefined,
    targetRole = 'your target role',
  ) {
    const parsedText = this.extractText(file, rawText);
    const result = await this.ai.reviewResume(parsedText, targetRole);

    const review = await this.prisma.resumeReview.create({
      data: {
        userId,
        fileUrl: file?.originalname ?? '',
        parsedText: parsedText.slice(0, 8000),
        score: result.score,
        strengths: result.strengths,
        gaps: result.gaps,
        suggestions: result.suggestions,
      },
    });
    return review;
  }

  async history(userId: string) {
    return this.prisma.resumeReview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PsychAnswer, scoreAnswers } from './psych-test.util';
import {
  AXIS_LABELS,
  PSYCH_TEST_VERSION,
  QUESTIONS,
} from './riasec.data';

@Injectable()
export class PsychTestService {
  constructor(private readonly prisma: PrismaService) {}

  /** The versioned question set — all locales included, UI picks. */
  getTest() {
    return {
      version: PSYCH_TEST_VERSION,
      scale: { min: 1, max: 5 },
      axisLabels: AXIS_LABELS,
      questions: QUESTIONS.map(({ id, text }) => ({ id, text })),
    };
  }

  async submit(userId: string, version: string, answers: PsychAnswer[]) {
    if (version !== PSYCH_TEST_VERSION) {
      throw new BadRequestException(
        `Unknown test version "${version}" (current: ${PSYCH_TEST_VERSION})`,
      );
    }
    const known = new Set(QUESTIONS.map((q) => q.id));
    const valid = answers.filter((a) => known.has(a.questionId));
    if (valid.length < QUESTIONS.length / 2) {
      throw new BadRequestException('Please answer at least half of the questions');
    }

    const { axes, profileCode } = scoreAnswers(valid);
    return this.prisma.psychTestResult.create({
      data: {
        userId,
        version,
        answers: valid as unknown as object,
        axes: axes as unknown as object,
        profileCode,
      },
    });
  }

  async latest(userId: string) {
    const result = await this.prisma.psychTestResult.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!result) throw new NotFoundException('No psych test result yet');
    return { ...result, axisLabels: AXIS_LABELS };
  }

  /** Nullable variant for aggregation (profile hub, recommendations). */
  latestOrNull(userId: string) {
    return this.prisma.psychTestResult.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

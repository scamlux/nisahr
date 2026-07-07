import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ASSESSMENT_VERSION,
  DEFAULT_PASS_THRESHOLD,
  DEFAULT_TIME_LIMIT_SEC,
  QUESTIONS_PER_ATTEMPT,
  findBank,
  publicQuestion,
} from './question-bank';
import {
  SubmittedAnswer,
  generateSerial,
  generateVerifyToken,
  pickQuestionOrder,
  scoreAttempt,
} from './assessment.util';

/** Grace window so a request in flight at the buzzer isn't unfairly rejected. */
const GRACE_SEC = 10;

@Injectable()
export class AssessmentService {
  constructor(private readonly prisma: PrismaService) {}

  private async ownedRoadmap(userId: string, roadmapId: string) {
    const roadmap = await this.prisma.roadmap.findUnique({ where: { id: roadmapId } });
    if (!roadmap) throw new NotFoundException('Roadmap not found');
    if (roadmap.userId !== userId) throw new ForbiddenException();
    return roadmap;
  }

  private isExpired(startedAt: Date, timeLimitSec: number): boolean {
    return Date.now() > startedAt.getTime() + (timeLimitSec + GRACE_SEC) * 1000;
  }

  private bankFor(roadmap: { slug: string; targetRole: string }) {
    // Prefer the catalog slug; fall back to the free-text target role.
    return findBank(roadmap.slug || roadmap.targetRole);
  }

  /**
   * Start (or resume) an attempt. Server picks and persists the served question
   * order; the answer key is never sent. If a certificate already exists the
   * assessment is already passed and cannot be retaken.
   */
  async start(userId: string, roadmapId: string) {
    const roadmap = await this.ownedRoadmap(userId, roadmapId);

    const existingCert = await this.prisma.roadmapCertificate.findUnique({ where: { roadmapId } });
    if (existingCert) {
      return { alreadyPassed: true, certificate: this.publicCertificate(existingCert) };
    }

    // Resume a live attempt; expire a stale one.
    const active = await this.prisma.finalAssessmentAttempt.findFirst({
      where: { userId, roadmapId, status: 'IN_PROGRESS' },
      orderBy: { startedAt: 'desc' },
    });
    if (active) {
      if (this.isExpired(active.startedAt, active.timeLimitSec)) {
        await this.prisma.finalAssessmentAttempt.update({
          where: { id: active.id },
          data: { status: 'EXPIRED' },
        });
      } else {
        return this.attemptView(active.id, active.role, active.questionOrder as string[], active.startedAt, active.timeLimitSec);
      }
    }

    const bank = this.bankFor(roadmap);
    const questionOrder = pickQuestionOrder(bank, QUESTIONS_PER_ATTEMPT);
    const attempt = await this.prisma.finalAssessmentAttempt.create({
      data: {
        userId,
        roadmapId,
        role: bank.role,
        version: ASSESSMENT_VERSION,
        questionOrder,
        timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
        passThreshold: DEFAULT_PASS_THRESHOLD,
      },
    });
    return this.attemptView(attempt.id, bank.role, questionOrder, attempt.startedAt, attempt.timeLimitSec);
  }

  /** Assemble the client view of an attempt — public questions only, in order. */
  private attemptView(
    attemptId: string,
    role: string,
    questionOrder: string[],
    startedAt: Date,
    timeLimitSec: number,
  ) {
    const bank = findBank(role);
    const byId = new Map(bank.questions.map((q) => [q.id, q]));
    const questions = questionOrder
      .map((id) => byId.get(id))
      .filter((q): q is NonNullable<typeof q> => Boolean(q))
      .map(publicQuestion);
    const deadline = new Date(startedAt.getTime() + timeLimitSec * 1000);
    const remainingSec = Math.max(0, Math.round((deadline.getTime() - Date.now()) / 1000));
    return {
      alreadyPassed: false,
      attemptId,
      role,
      version: ASSESSMENT_VERSION,
      questions,
      total: questions.length,
      passThreshold: DEFAULT_PASS_THRESHOLD,
      timeLimitSec,
      startedAt,
      deadline,
      remainingSec,
    };
  }

  /** Score + grade an attempt; issue a certificate on pass. */
  async submit(userId: string, attemptId: string, answers: SubmittedAnswer[]) {
    const attempt = await this.prisma.finalAssessmentAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId) throw new ForbiddenException();
    if (attempt.status !== 'IN_PROGRESS') {
      throw new BadRequestException('This attempt has already been submitted');
    }
    if (this.isExpired(attempt.startedAt, attempt.timeLimitSec)) {
      await this.prisma.finalAssessmentAttempt.update({
        where: { id: attempt.id },
        data: { status: 'EXPIRED', answers: answers as object, submittedAt: new Date() },
      });
      throw new BadRequestException('Time limit exceeded — attempt expired');
    }

    const bank = findBank(attempt.role);
    const questionOrder = attempt.questionOrder as string[];
    const { score, correct, total } = scoreAttempt(bank, questionOrder, answers);
    const passed = score >= attempt.passThreshold;

    await this.prisma.finalAssessmentAttempt.update({
      where: { id: attempt.id },
      data: {
        answers: answers as object,
        score,
        status: passed ? 'PASSED' : 'FAILED',
        submittedAt: new Date(),
      },
    });

    let certificate: Awaited<ReturnType<AssessmentService['issueCertificate']>> = null;
    if (passed) certificate = await this.issueCertificate(userId, attempt.roadmapId, attempt.id, bank.role, score);

    return {
      status: passed ? 'PASSED' : 'FAILED',
      score,
      correct,
      total,
      passThreshold: attempt.passThreshold,
      breakdown: this.topicBreakdown(bank, questionOrder, answers),
      feedback: this.feedback(passed, score, bank, questionOrder, answers),
      certificate: certificate ? this.publicCertificate(certificate) : null,
    };
  }

  /** Issue exactly one certificate per roadmap; concurrent double-submit is safe. */
  private async issueCertificate(
    userId: string,
    roadmapId: string,
    attemptId: string,
    role: string,
    score: number,
  ) {
    const existing = await this.prisma.roadmapCertificate.findUnique({ where: { roadmapId } });
    if (existing) return existing;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const year = new Date().getFullYear();
    try {
      return await this.prisma.roadmapCertificate.create({
        data: {
          userId,
          roadmapId,
          attemptId,
          role,
          recipient: user?.name ?? 'CareerOS Learner',
          score,
          serial: generateSerial(year),
          verifyToken: generateVerifyToken(),
        },
      });
    } catch {
      // Unique race (roadmapId/attemptId) — return whatever won.
      return this.prisma.roadmapCertificate.findUnique({ where: { roadmapId } });
    }
  }

  /** Owner-facing certificate for a roadmap (includes the verify token). */
  async getCertificate(userId: string, roadmapId: string) {
    await this.ownedRoadmap(userId, roadmapId);
    const cert = await this.prisma.roadmapCertificate.findUnique({ where: { roadmapId } });
    if (!cert) throw new NotFoundException('No certificate for this roadmap yet');
    return this.publicCertificate(cert, true);
  }

  /** Latest attempt + certificate state, for rendering the assessment tab. */
  async statusFor(userId: string, roadmapId: string) {
    await this.ownedRoadmap(userId, roadmapId);
    const [attempt, cert] = await Promise.all([
      this.prisma.finalAssessmentAttempt.findFirst({
        where: { userId, roadmapId },
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.roadmapCertificate.findUnique({ where: { roadmapId } }),
    ]);
    return {
      lastStatus: attempt?.status ?? null,
      lastScore: attempt?.score ?? null,
      passThreshold: attempt?.passThreshold ?? DEFAULT_PASS_THRESHOLD,
      certificate: cert ? this.publicCertificate(cert, true) : null,
    };
  }

  /**
   * PUBLIC certificate verification. No auth, and — critically — no PII: returns
   * recipient name, role, score, serial and date only. A wrong/tampered token
   * simply doesn't match and yields { valid: false }.
   */
  async verify(token: string) {
    const cert = await this.prisma.roadmapCertificate.findUnique({ where: { verifyToken: token } });
    if (!cert) return { valid: false };
    return {
      valid: true,
      recipient: cert.recipient,
      role: cert.role,
      score: cert.score,
      serial: cert.serial,
      issuedAt: cert.issuedAt,
    };
  }

  private publicCertificate(
    cert: {
      serial: string;
      verifyToken: string;
      recipient: string;
      role: string;
      score: number;
      issuedAt: Date;
      roadmapId: string;
    },
    includeToken = false,
  ) {
    return {
      serial: cert.serial,
      recipient: cert.recipient,
      role: cert.role,
      score: cert.score,
      issuedAt: cert.issuedAt,
      roadmapId: cert.roadmapId,
      ...(includeToken ? { verifyToken: cert.verifyToken } : {}),
    };
  }

  private topicBreakdown(
    bank: ReturnType<typeof findBank>,
    questionOrder: string[],
    answers: SubmittedAnswer[],
  ): { topic: string; correct: number; total: number }[] {
    const byId = new Map(bank.questions.map((q) => [q.id, q]));
    const ans = new Map(answers.map((a) => [a.questionId, a.selectedIndex]));
    const agg = new Map<string, { correct: number; total: number }>();
    for (const id of questionOrder) {
      const q = byId.get(id);
      if (!q) continue;
      const row = agg.get(q.topic) ?? { correct: 0, total: 0 };
      row.total++;
      if (ans.get(id) === q.correctIndex) row.correct++;
      agg.set(q.topic, row);
    }
    return [...agg.entries()].map(([topic, v]) => ({ topic, ...v }));
  }

  private feedback(
    passed: boolean,
    score: number,
    bank: ReturnType<typeof findBank>,
    questionOrder: string[],
    answers: SubmittedAnswer[],
  ): string {
    const weak = this.topicBreakdown(bank, questionOrder, answers)
      .filter((t) => t.correct < t.total)
      .map((t) => t.topic);
    if (passed) {
      return weak.length
        ? `Great work — you passed with ${score}%. Brush up on ${weak.slice(0, 3).join(', ')} to go from competent to strong.`
        : `Outstanding — a perfect run at ${score}%. You've clearly mastered the ${bank.role} fundamentals.`;
    }
    return `You scored ${score}%. Focus your review on ${weak.slice(0, 3).join(', ') || 'the core topics'}, then retake — you're close.`;
  }
}

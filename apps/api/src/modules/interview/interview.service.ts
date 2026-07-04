import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InterviewType, StartInterviewDto } from '@careeros/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { computeInterviewReport, InterviewTurn as Turn } from './interview.util';

@Injectable()
export class InterviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async start(userId: string, dto: StartInterviewDto) {
    const questions = this.ai.interviewQuestions(dto.type, dto.targetRole);
    const transcript: Turn[] = questions.map((q) => ({ question: q }));

    const interview = await this.prisma.mockInterview.create({
      data: {
        userId,
        type: dto.type as InterviewType,
        targetRole: dto.targetRole,
        transcript: transcript as object,
      },
    });

    return {
      interviewId: interview.id,
      type: interview.type,
      targetRole: interview.targetRole,
      totalQuestions: questions.length,
      currentIndex: 0,
      question: questions[0],
      completed: false,
    };
  }

  async answer(userId: string, interviewId: string, answer: string) {
    const interview = await this.prisma.mockInterview.findUnique({ where: { id: interviewId } });
    if (!interview) throw new NotFoundException('Interview not found');
    if (interview.userId !== userId) throw new ForbiddenException();
    if (interview.completed) throw new ForbiddenException('Interview already completed');

    const transcript = (interview.transcript as unknown as Turn[]) ?? [];
    const currentIndex = transcript.findIndex((t) => t.answer === undefined);
    if (currentIndex === -1) throw new ForbiddenException('No pending question');

    const evaln = this.ai.evaluateAnswer(answer);
    transcript[currentIndex] = {
      ...transcript[currentIndex],
      answer,
      score: evaln.score,
      feedback: evaln.feedback,
    };

    const nextIndex = transcript.findIndex((t) => t.answer === undefined);
    const completed = nextIndex === -1;

    let finalScore = 0;
    let finalFeedback = '';
    if (completed) {
      const scores = transcript.map((t) => t.score ?? 0);
      finalScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      finalFeedback =
        finalScore >= 80
          ? 'Excellent interview. Your answers were structured and concrete — you are interview-ready.'
          : finalScore >= 60
            ? 'Solid performance. Tighten weaker answers with the situation→action→result structure and concrete metrics.'
            : 'Keep practicing. Focus on giving specific examples and measurable outcomes for each answer.';
    }

    await this.prisma.mockInterview.update({
      where: { id: interviewId },
      data: {
        transcript: transcript as object,
        completed,
        score: finalScore,
        feedback: finalFeedback,
      },
    });

    return {
      interviewId,
      evaluation: evaln,
      currentIndex: completed ? transcript.length : nextIndex,
      totalQuestions: transcript.length,
      question: completed ? null : transcript[nextIndex].question,
      completed,
      finalScore: completed ? finalScore : undefined,
      finalFeedback: completed ? finalFeedback : undefined,
    };
  }

  async history(userId: string) {
    const interviews = await this.prisma.mockInterview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: {
        id: true,
        type: true,
        targetRole: true,
        score: true,
        completed: true,
        createdAt: true,
        transcript: true,
      },
    });
    // Lightweight list rows: question count derived, no full transcript echoed.
    return interviews.map((i) => {
      const turns = (i.transcript as unknown as Turn[]) ?? [];
      return {
        id: i.id,
        type: i.type,
        targetRole: i.targetRole,
        score: i.score,
        completed: i.completed,
        createdAt: i.createdAt,
        answered: turns.filter((t) => !!t.answer).length,
        total: turns.length,
      };
    });
  }

  /** Full report for one interview: transcript + dimension breakdown + insights. */
  async getReport(userId: string, id: string) {
    const interview = await this.prisma.mockInterview.findUnique({ where: { id } });
    if (!interview) throw new NotFoundException('Interview not found');
    if (interview.userId !== userId) throw new ForbiddenException();

    const turns = (interview.transcript as unknown as Turn[]) ?? [];
    const report = computeInterviewReport(
      turns,
      interview.completed ? interview.score : undefined,
    );

    return {
      id: interview.id,
      type: interview.type,
      targetRole: interview.targetRole,
      completed: interview.completed,
      score: interview.score,
      createdAt: interview.createdAt,
      transcript: turns,
      report,
    };
  }
}

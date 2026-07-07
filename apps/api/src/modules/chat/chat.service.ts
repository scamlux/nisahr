import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ExperienceLevel } from '@careeros/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { LlmMessage } from '../ai/llm-provider.interface';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async createSession(userId: string, title?: string) {
    return this.prisma.chatSession.create({
      data: { userId, title: title ?? 'New conversation' },
    });
  }

  async listSessions(userId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 1 } },
    });
  }

  private async ownedSession(userId: string, sessionId: string) {
    const session = await this.prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Chat session not found');
    if (session.userId !== userId) throw new ForbiddenException();
    return session;
  }

  async getSession(userId: string, sessionId: string) {
    await this.ownedSession(userId, sessionId);
    return this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async sendMessage(
    userId: string,
    sessionId: string,
    content: string,
    ai?: { provider?: string; model?: string },
  ) {
    await this.ownedSession(userId, sessionId);

    await this.prisma.chatMessage.create({
      data: { sessionId, role: 'user', content },
    });

    const profile = await this.prisma.careerProfile.findUnique({ where: { userId } });
    const history = await this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });
    const llmHistory: LlmMessage[] = history.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const { text, structuredPayload, meta } = await this.ai.consult(
      {
        interests: profile?.interests ?? [],
        goals: profile?.goals ?? '',
        experienceLevel: (profile?.experienceLevel as ExperienceLevel) ?? ExperienceLevel.BEGINNER,
        currentSkills: Array.isArray(profile?.currentSkills)
          ? (profile?.currentSkills as string[])
          : [],
        strengths: profile?.strengths ?? '',
        weaknesses: profile?.weaknesses ?? '',
      },
      llmHistory,
      ai,
    );

    const assistant = await this.prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: text,
        structuredPayload: { ...structuredPayload, ai: meta } as object,
      },
    });

    // Auto-title the session from the first user message.
    const count = await this.prisma.chatMessage.count({ where: { sessionId, role: 'user' } });
    if (count === 1) {
      await this.prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: content.slice(0, 60) },
      });
    }

    return assistant;
  }
}

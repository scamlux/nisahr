import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SubmitQuizDto } from '@careeros/shared';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService) {}

  async resources(skillId?: string) {
    return this.prisma.learningResource.findMany({
      where: skillId ? { skillId } : {},
      take: 100,
      orderBy: { durationMin: 'asc' },
    });
  }

  async catalog() {
    return this.prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: { select: { name: true } },
        lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, durationMin: true, order: true } },
        _count: { select: { lessons: true, enrollments: true, quizzes: true } },
      },
    });
  }

  async course(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { name: true } },
        lessons: { orderBy: { order: 'asc' } },
        quizzes: { include: { questions: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async enroll(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId },
    });
  }

  async myEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: { lessons: { select: { id: true } }, _count: { select: { lessons: true } } },
        },
      },
    });
  }

  async completeLesson(userId: string, courseId: string, lessonId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) throw new ForbiddenException('Enroll in the course first');

    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson || lesson.courseId !== courseId) throw new NotFoundException('Lesson not found');

    const done = new Set(
      Array.isArray(enrollment.completedLessonIds)
        ? (enrollment.completedLessonIds as string[])
        : [],
    );
    const wasNew = !done.has(lessonId);
    done.add(lessonId);

    const totalLessons = await this.prisma.lesson.count({ where: { courseId } });
    const progressPct = totalLessons ? Math.round((done.size / totalLessons) * 100) : 0;

    const updated = await this.prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: { completedLessonIds: Array.from(done), progressPct },
    });

    if (wasNew) {
      await this.prisma.progressEvent.create({
        data: { userId, type: 'LESSON_DONE', refId: lessonId, hoursSpent: lesson.durationMin / 60 },
      });
    }

    // Issue certificate on 100% completion.
    let certificate: Record<string, unknown> | null = null;
    if (progressPct >= 100) {
      certificate = await this.prisma.certificate.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: {},
        create: { userId, courseId },
      });
    }

    return { enrollment: updated, certificate };
  }

  async submitQuiz(userId: string, quizId: string, dto: SubmitQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    let correct = 0;
    const review = quiz.questions.map((q, i) => {
      const picked = dto.answers[i];
      const isCorrect = picked === q.correctIndex;
      if (isCorrect) correct++;
      return { questionId: q.id, picked, correctIndex: q.correctIndex, isCorrect };
    });
    const score = quiz.questions.length
      ? Math.round((correct / quiz.questions.length) * 100)
      : 0;
    const passed = score >= 70;

    return { score, passed, correct, total: quiz.questions.length, review };
  }

  async myCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: { course: { select: { title: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }
}

import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ROADMAP_TEMPLATES } from '../src/modules/ai/roadmap-templates';

const prisma = new PrismaClient();

async function instantiateRoadmap(
  userId: string,
  tmpl: (typeof ROADMAP_TEMPLATES)[number],
  weeklyHours = 10,
  progressRatio = 0,
) {
  const roadmap = await prisma.roadmap.create({
    data: {
      userId,
      targetRole: tmpl.targetRole,
      level: tmpl.level,
      weeklyHours,
      estimatedWeeks: tmpl.estimatedWeeks,
      isAiGenerated: false,
      stages: {
        create: tmpl.stages.map((s) => ({
          order: s.order,
          title: s.title,
          description: s.description,
          milestone: s.milestone,
          resources: {
            create: s.resources.map((r) => ({
              title: r.title,
              type: r.type,
              url: r.url,
              provider: r.provider,
              durationMin: r.durationMin,
            })),
          },
          tasks: {
            create: s.tasks.map((t) => ({
              title: t.title,
              description: t.description,
              isAutoChecked: t.isAutoChecked,
            })),
          },
        })),
      },
    },
    include: { stages: { orderBy: { order: 'asc' } } },
  });

  // Link skills.
  for (let i = 0; i < tmpl.stages.length; i++) {
    const aiStage = tmpl.stages[i];
    const dbStage = roadmap.stages[i];
    for (const sk of aiStage.skills) {
      const skill = await prisma.skill.upsert({
        where: { name: sk.name },
        update: { category: sk.category },
        create: { name: sk.name, category: sk.category },
      });
      await prisma.roadmapStageSkill.create({
        data: { stageId: dbStage.id, skillId: skill.id },
      });
      // Attach a learning resource to the skill for the Learning Hub.
      const r = aiStage.resources[0];
      if (r) {
        await prisma.learningResource.create({
          data: {
            title: r.title,
            type: r.type,
            url: r.url,
            provider: r.provider,
            durationMin: r.durationMin,
            skillId: skill.id,
          },
        });
      }
    }
  }

  // Apply seed progress to the first N stages.
  if (progressRatio > 0) {
    const stageCount = Math.max(1, Math.floor(roadmap.stages.length * progressRatio));
    for (let i = 0; i < stageCount; i++) {
      const stage = roadmap.stages[i];
      await prisma.roadmapStage.update({ where: { id: stage.id }, data: { status: 'DONE' } });
      await prisma.roadmapStageSkill.updateMany({ where: { stageId: stage.id }, data: { status: 'DONE' } });
      await prisma.practicalTask.updateMany({ where: { stageId: stage.id }, data: { completed: true } });
    }
  }

  return roadmap;
}

async function seedProgressEvents(userId: string) {
  const types: Prisma.ProgressEventCreateManyInput['type'][] = [
    'SKILL_DONE',
    'TASK_DONE',
    'LESSON_DONE',
    'STAGE_DONE',
  ];
  const events: Prisma.ProgressEventCreateManyInput[] = [];
  // Build an active streak over the last 9 days (skip one to keep it realistic).
  for (let d = 0; d < 12; d++) {
    if (d === 4) continue; // gap
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - d);
    const count = 1 + (d % 3);
    for (let i = 0; i < count; i++) {
      events.push({
        userId,
        type: types[(d + i) % types.length],
        hoursSpent: 0.5 + ((d + i) % 3) * 0.5,
        createdAt: date,
      });
    }
  }
  await prisma.progressEvent.createMany({ data: events });
}

async function main() {
  console.log('🌱 Seeding CareerOS...');

  // Clean slate (order matters for FKs; cascades handle children).
  await prisma.progressEvent.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.learningResource.deleteMany();
  await prisma.roadmapStageSkill.deleteMany();
  await prisma.practicalTask.deleteMany();
  await prisma.roadmapStage.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.mockInterview.deleteMany();
  await prisma.resumeReview.deleteMany();
  await prisma.jobReadiness.deleteMany();
  await prisma.careerRecommendation.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.careerProfile.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@careeros.dev',
      name: 'Ada Admin',
      passwordHash: hash('password123'),
      emailVerified: true,
      role: 'ADMIN',
      plan: 'PREMIUM',
      careerProfile: { create: { onboardingCompleted: true } },
      subscription: { create: { plan: 'PREMIUM' } },
    },
  });

  const instructor = await prisma.user.create({
    data: {
      email: 'instructor@careeros.dev',
      name: 'Ivan Instructor',
      passwordHash: hash('password123'),
      emailVerified: true,
      role: 'INSTRUCTOR',
      plan: 'PREMIUM',
      careerProfile: { create: { onboardingCompleted: true } },
      subscription: { create: { plan: 'PREMIUM' } },
    },
  });

  const freeStudent = await prisma.user.create({
    data: {
      email: 'student@careeros.dev',
      name: 'Sam Student',
      passwordHash: hash('password123'),
      emailVerified: true,
      role: 'STUDENT',
      plan: 'FREE',
      careerProfile: {
        create: {
          onboardingCompleted: true,
          interests: ['web', 'design', 'creative'],
          goals: 'Become a frontend developer and get my first job',
          experienceLevel: 'BEGINNER',
          currentSkills: ['HTML', 'CSS'],
          strengths: 'Curious, consistent',
          weaknesses: 'No professional experience yet',
          preferredWorkStyle: 'Remote, collaborative',
        },
      },
      subscription: { create: { plan: 'FREE' } },
    },
  });

  const premiumStudent = await prisma.user.create({
    data: {
      email: 'premium@careeros.dev',
      name: 'Pia Premium',
      passwordHash: hash('password123'),
      emailVerified: true,
      role: 'STUDENT',
      plan: 'PREMIUM',
      careerProfile: {
        create: {
          onboardingCompleted: true,
          interests: ['data', 'math', 'ai'],
          goals: 'Transition into AI engineering',
          experienceLevel: 'JUNIOR',
          currentSkills: ['Python', 'SQL', 'Statistics'],
          strengths: 'Analytical, fast learner',
          weaknesses: 'New to deep learning',
          preferredWorkStyle: 'Hybrid, focused',
        },
      },
      subscription: { create: { plan: 'PREMIUM' } },
    },
  });

  // F7: an OAuth-only account (no password) to exercise Google sign-in.
  await prisma.user.create({
    data: {
      email: 'google.demo@careeros.dev',
      name: 'Google Demo',
      passwordHash: null,
      provider: 'google',
      providerId: 'seed-google-demo',
      avatarUrl: null,
      emailVerified: true,
      role: 'STUDENT',
      plan: 'FREE',
      careerProfile: { create: { onboardingCompleted: false } },
      subscription: { create: {} },
    },
  });

  // Seed all 7 standard roadmaps under the admin (browsable templates).
  for (const tmpl of ROADMAP_TEMPLATES) {
    await instantiateRoadmap(admin.id, tmpl);
  }

  // Give students personalized roadmaps with progress.
  const frontendTmpl = ROADMAP_TEMPLATES.find((t) => t.targetRole === 'Frontend Developer')!;
  const aiTmpl = ROADMAP_TEMPLATES.find((t) => t.targetRole === 'AI Engineer')!;
  await instantiateRoadmap(freeStudent.id, frontendTmpl, 8, 0.3);
  await instantiateRoadmap(premiumStudent.id, aiTmpl, 15, 0.5);

  await seedProgressEvents(freeStudent.id);
  await seedProgressEvents(premiumStudent.id);

  // Career recommendations for the premium student.
  await prisma.careerRecommendation.createMany({
    data: [
      { userId: premiumStudent.id, title: 'AI Engineer', reason: 'Matches your interest in AI and Python skills.', entryDifficulty: 'HIGH', estimatedMonths: 12, score: 91 },
      { userId: premiumStudent.id, title: 'Data Analyst', reason: 'Quick entry leveraging your SQL and statistics.', entryDifficulty: 'LOW', estimatedMonths: 6, score: 84 },
      { userId: premiumStudent.id, title: 'Backend Developer', reason: 'Strong logical foundation translates well.', entryDifficulty: 'MEDIUM', estimatedMonths: 8, score: 76 },
    ],
  });

  // Sample resume review + interview + job readiness for premium student dashboards.
  await prisma.resumeReview.create({
    data: {
      userId: premiumStudent.id,
      fileUrl: 'pia-resume.pdf',
      parsedText: 'Junior data analyst with Python and SQL. Built dashboards and an A/B testing pipeline.',
      score: 72,
      strengths: ['Quantified results', 'Relevant skills (Python, SQL)'],
      gaps: ['No deep learning projects yet'],
      suggestions: ['Add a RAG/LLM project', 'Tailor summary toward "AI Engineer"'],
    },
  });

  // ---- Internal LMS: courses, lessons, quizzes ----
  const courses = [
    {
      title: 'React from Zero to Hero',
      description: 'Build modern UIs with React, hooks and TanStack Query.',
      coverColor: '#6d5efc',
      price: 0,
      lessons: [
        { title: 'Why React?', durationMin: 8 },
        { title: 'Components & Props', durationMin: 14 },
        { title: 'State & Hooks', durationMin: 18 },
        { title: 'Data Fetching with React Query', durationMin: 20 },
      ],
      quiz: {
        title: 'React Fundamentals Quiz',
        questions: [
          { prompt: 'What hook manages local state?', options: ['useState', 'useFetch', 'useStyle'], correctIndex: 0 },
          { prompt: 'JSX compiles to…', options: ['HTML files', 'React.createElement calls', 'CSS'], correctIndex: 1 },
          { prompt: 'Keys in lists help React…', options: ['style items', 'identify changes', 'fetch data'], correctIndex: 1 },
        ],
      },
    },
    {
      title: 'SQL for Data Analysts',
      description: 'Answer real business questions with SQL.',
      coverColor: '#22b8a6',
      price: 0,
      lessons: [
        { title: 'SELECT basics', durationMin: 10 },
        { title: 'JOINs explained', durationMin: 16 },
        { title: 'Aggregations & GROUP BY', durationMin: 15 },
      ],
      quiz: {
        title: 'SQL Basics Quiz',
        questions: [
          { prompt: 'Which clause filters rows?', options: ['WHERE', 'ORDER BY', 'GROUP BY'], correctIndex: 0 },
          { prompt: 'INNER JOIN returns…', options: ['all rows', 'matching rows', 'no rows'], correctIndex: 1 },
        ],
      },
    },
    {
      title: 'Intro to Product Management',
      description: 'Discovery, prioritization and metrics for aspiring PMs.',
      coverColor: '#f0a020',
      price: 0,
      lessons: [
        { title: 'What PMs actually do', durationMin: 12 },
        { title: 'Prioritization with RICE', durationMin: 14 },
      ],
      quiz: {
        title: 'PM Basics Quiz',
        questions: [
          { prompt: 'RICE stands for Reach, Impact, Confidence and…', options: ['Effort', 'Energy', 'Earnings'], correctIndex: 0 },
        ],
      },
    },
  ];

  for (const c of courses) {
    await prisma.course.create({
      data: {
        instructorId: instructor.id,
        title: c.title,
        description: c.description,
        coverColor: c.coverColor,
        price: c.price,
        published: true,
        lessons: {
          create: c.lessons.map((l, i) => ({
            title: l.title,
            order: i,
            durationMin: l.durationMin,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            content: `Lesson content for "${l.title}".`,
          })),
        },
        quizzes: {
          create: [
            {
              title: c.quiz.title,
              questions: {
                create: c.quiz.questions.map((q) => ({
                  prompt: q.prompt,
                  options: q.options,
                  correctIndex: q.correctIndex,
                })),
              },
            },
          ],
        },
      },
    });
  }

  // Enroll premium student in the first course with partial progress.
  const reactCourse = await prisma.course.findFirst({ where: { title: 'React from Zero to Hero' }, include: { lessons: true } });
  if (reactCourse) {
    await prisma.enrollment.create({
      data: {
        userId: premiumStudent.id,
        courseId: reactCourse.id,
        progressPct: 50,
        completedLessonIds: reactCourse.lessons.slice(0, 2).map((l) => l.id),
      },
    });
  }

  console.log('✅ Seed complete.');
  console.log('   Logins (password: password123):');
  console.log('   • admin@careeros.dev       (ADMIN, PREMIUM)');
  console.log('   • instructor@careeros.dev  (INSTRUCTOR, PREMIUM)');
  console.log('   • student@careeros.dev     (STUDENT, FREE)');
  console.log('   • premium@careeros.dev     (STUDENT, PREMIUM)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Additive demo seed — creates a handful of fully-populated mock accounts so
 * EVERY feature renders with real data. Unlike `seed.ts`, this NEVER wipes the
 * database: it only deletes-and-recreates its own well-known demo emails, so it
 * is safe to run against production.
 *
 * Run:  DOTENV… ts-node prisma/seed-demo.ts   (uses DIRECT_URL, port 5432)
 *
 * Data shapes/helpers are imported straight from the app so the mock rows match
 * exactly what the real read paths expect (psych scoring, graph layout,
 * assessment scoring, certificate serial/token).
 */
import { randomBytes } from 'crypto';
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import {
  QUESTIONS as PSYCH_QUESTIONS,
  PSYCH_TEST_VERSION,
} from '../src/modules/psych-test/riasec.data';
import { scoreAnswers } from '../src/modules/psych-test/psych-test.util';

import {
  GRAPH_TEMPLATES,
  findGraphTemplate,
  RoadmapGraphTemplate,
} from '../src/modules/roadmap/graph-templates';
import { ROADMAP_TEMPLATES, pickTemplate } from '../src/modules/ai/roadmap-templates';

import {
  findBank,
  ASSESSMENT_VERSION,
  QUESTIONS_PER_ATTEMPT,
  DEFAULT_TIME_LIMIT_SEC,
  DEFAULT_PASS_THRESHOLD,
} from '../src/modules/assessment/question-bank';
import {
  pickQuestionOrder,
  scoreAttempt,
  generateSerial,
  generateVerifyToken,
} from '../src/modules/assessment/assessment.util';

const prisma = new PrismaClient();
const hash = (pw: string) => bcrypt.hashSync(pw, 10);

// Shareable password for the (non-privileged) STUDENT demo logins.
const DEMO_PASSWORD = 'CareerOS2026!';

/** roadmap.sh-style layout — mirrors RoadmapGraphService.layoutTemplate. */
const SPINE_GAP_Y = 200;
const BRANCH_X = 380;
const BRANCH_GAP_Y = 96;
function layoutTemplate(
  template: RoadmapGraphTemplate,
): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();
  const topics = template.nodes.filter((n) => n.type === 'TOPIC');
  topics.forEach((topic, i) => pos.set(topic.key, { x: 0, y: i * SPINE_GAP_Y }));

  const parentOf = new Map<string, string>();
  for (const edge of template.edges) {
    const from = template.nodes.find((n) => n.key === edge.from);
    const to = template.nodes.find((n) => n.key === edge.to);
    if (from?.type === 'TOPIC' && to && to.type !== 'TOPIC' && !parentOf.has(to.key)) {
      parentOf.set(to.key, from.key);
    }
  }
  const childrenOf = new Map<string, string[]>();
  for (const node of template.nodes) {
    if (node.type === 'TOPIC') continue;
    const parent = parentOf.get(node.key) ?? topics[0]?.key;
    if (!parent) continue;
    const list = childrenOf.get(parent) ?? [];
    list.push(node.key);
    childrenOf.set(parent, list);
  }
  for (const [parent, children] of childrenOf) {
    const base = pos.get(parent) ?? { x: 0, y: 0 };
    children.forEach((childKey, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const slot = Math.floor(i / 2);
      pos.set(childKey, { x: side * BRANCH_X, y: base.y - BRANCH_GAP_Y / 2 + slot * BRANCH_GAP_Y });
    });
  }
  template.nodes.forEach((n, i) => {
    if (!pos.has(n.key)) pos.set(n.key, { x: 0, y: (topics.length + i) * SPINE_GAP_Y });
  });
  return pos;
}

/** Build a full RIASEC answer set from per-axis Likert values → consistent axes. */
function buildPsychAnswers(perAxis: Record<string, number>) {
  return PSYCH_QUESTIONS.map((q) => ({
    questionId: q.id,
    value: perAxis[q.axis] ?? 3,
  }));
}

// ---------------------------------------------------------------------------
// Demo account definitions
// ---------------------------------------------------------------------------
const INSTRUCTOR_EMAIL = 'demo.instructor@careeros.dev';

interface StudentDef {
  email: string;
  name: string;
  slug: string; // graph template + assessment bank slug
  level: 'BEGINNER' | 'JUNIOR' | 'MID' | 'SENIOR';
  psych: Record<string, number>; // per-axis Likert 1..5
  profile: {
    interests: string[];
    goals: string;
    currentSkills: string[];
    strengths: string;
    weaknesses: string;
    preferredWorkStyle: string;
  };
  recommendations: { title: string; reason: string; entryDifficulty: string; estimatedMonths: number; score: number }[];
  resume: { score: number; strengths: string[]; gaps: string[]; suggestions: string[]; parsedText: string };
  interview: { type: 'HR' | 'TECHNICAL' | 'BEHAVIORAL'; transcript: { question: string; answer: string; score: number; feedback: string }[] };
  jobReadiness: { skillsCoverage: number; roadmapProgress: number; resumeScore: number; interviewScore: number };
}

const STUDENTS: StudentDef[] = [
  {
    email: 'demo.frontend@careeros.dev',
    name: 'Alina Frontend',
    slug: 'frontend-developer',
    level: 'JUNIOR',
    psych: { R: 2, I: 4, A: 5, S: 3, E: 3, C: 3 },
    profile: {
      interests: ['web', 'design', 'ui', 'creative'],
      goals: 'Land a junior frontend role at a product company within 6 months.',
      currentSkills: ['HTML', 'CSS', 'JavaScript', 'Git'],
      strengths: 'Strong eye for design, consistent daily practice.',
      weaknesses: 'Limited experience with large codebases and testing.',
      preferredWorkStyle: 'Remote, collaborative, design-driven.',
    },
    recommendations: [
      { title: 'Frontend Developer', reason: 'Matches interest in UI and creative work with existing HTML/CSS/JS.', entryDifficulty: 'LOW', estimatedMonths: 6, score: 92 },
      { title: 'UI/UX Designer', reason: 'Strong artistic axis and design sensibility.', entryDifficulty: 'MEDIUM', estimatedMonths: 8, score: 81 },
      { title: 'Product Engineer', reason: 'Blend of building and user empathy.', entryDifficulty: 'MEDIUM', estimatedMonths: 10, score: 74 },
    ],
    resume: {
      score: 78,
      strengths: ['Clean portfolio projects', 'Modern stack (React, TanStack Query)'],
      gaps: ['No professional team experience yet'],
      suggestions: ['Add a measurable impact bullet', 'Highlight accessibility work'],
      parsedText: 'Junior frontend developer. Built 4 React apps, responsive layouts, reusable component library.',
    },
    interview: {
      type: 'BEHAVIORAL',
      transcript: [
        { question: 'Tell me about a project you are proud of.', answer: 'I built a component library used across 4 apps, which cut new-page build time by ~40%.', score: 84, feedback: 'Strong, structured, quantified.' },
        { question: 'How do you handle feedback on your designs?', answer: 'I treat it as data, ask clarifying questions, and iterate quickly.', score: 79, feedback: 'Good mindset; add a concrete example.' },
        { question: 'Describe a bug you found hard to fix.', answer: 'A stale closure in a useEffect caused a race condition; I fixed the dependency array and added a test.', score: 82, feedback: 'Clear technical reasoning.' },
      ],
    },
    jobReadiness: { skillsCoverage: 74, roadmapProgress: 66, resumeScore: 78, interviewScore: 82 },
  },
  {
    email: 'demo.backend@careeros.dev',
    name: 'Bekzod Backend',
    slug: 'backend-developer',
    level: 'JUNIOR',
    psych: { R: 3, I: 5, A: 2, S: 3, E: 3, C: 5 },
    profile: {
      interests: ['backend', 'databases', 'systems', 'apis'],
      goals: 'Become a backend engineer working with Node.js and PostgreSQL.',
      currentSkills: ['JavaScript', 'Node.js', 'SQL', 'Git', 'Linux'],
      strengths: 'Logical, methodical, enjoys debugging.',
      weaknesses: 'Less experience with distributed systems and scaling.',
      preferredWorkStyle: 'Hybrid, focused, deep-work blocks.',
    },
    recommendations: [
      { title: 'Backend Developer', reason: 'Strong investigative and conventional axes fit server work.', entryDifficulty: 'MEDIUM', estimatedMonths: 8, score: 90 },
      { title: 'DevOps Engineer', reason: 'Comfort with Linux and systems.', entryDifficulty: 'HIGH', estimatedMonths: 12, score: 72 },
      { title: 'Database Engineer', reason: 'Enjoys data modelling and SQL.', entryDifficulty: 'MEDIUM', estimatedMonths: 9, score: 76 },
    ],
    resume: {
      score: 74,
      strengths: ['Solid REST API projects', 'PostgreSQL schema design'],
      gaps: ['No production on-call experience'],
      suggestions: ['Add caching/perf work', 'Show a system design diagram'],
      parsedText: 'Backend developer. Built REST APIs with NestJS + Prisma, designed normalized PostgreSQL schemas.',
    },
    interview: {
      type: 'TECHNICAL',
      transcript: [
        { question: 'How would you design a rate limiter?', answer: 'Token bucket in Redis keyed by client id, with a sliding window fallback.', score: 80, feedback: 'Solid, mention distributed clock skew.' },
        { question: 'Explain database indexing.', answer: 'B-tree indexes speed lookups at write cost; I pick indexes from real query patterns.', score: 78, feedback: 'Good; add composite index example.' },
        { question: 'When would you denormalize?', answer: 'For read-heavy paths where joins dominate, trading storage and write complexity.', score: 76, feedback: 'Reasonable trade-off framing.' },
      ],
    },
    jobReadiness: { skillsCoverage: 70, roadmapProgress: 62, resumeScore: 74, interviewScore: 78 },
  },
  {
    email: 'demo.data@careeros.dev',
    name: 'Dilnoza Data',
    slug: 'data-analyst',
    level: 'JUNIOR',
    psych: { R: 3, I: 5, A: 3, S: 3, E: 3, C: 4 },
    profile: {
      interests: ['data', 'analytics', 'statistics', 'ai'],
      goals: 'Transition into a data analyst role and grow toward AI engineering.',
      currentSkills: ['Python', 'SQL', 'Statistics', 'Excel'],
      strengths: 'Analytical, fast learner, strong with numbers.',
      weaknesses: 'New to production data pipelines.',
      preferredWorkStyle: 'Hybrid, focused, insight-driven.',
    },
    recommendations: [
      { title: 'Data Analyst', reason: 'Strong investigative axis with SQL and statistics.', entryDifficulty: 'LOW', estimatedMonths: 6, score: 88 },
      { title: 'AI Engineer', reason: 'Python plus analytical strength scales to ML.', entryDifficulty: 'HIGH', estimatedMonths: 12, score: 79 },
      { title: 'Business Intelligence Analyst', reason: 'Comfort turning data into decisions.', entryDifficulty: 'LOW', estimatedMonths: 5, score: 82 },
    ],
    resume: {
      score: 80,
      strengths: ['Quantified dashboard impact', 'Python + SQL fluency'],
      gaps: ['No deep-learning project yet'],
      suggestions: ['Add an A/B test writeup', 'Tailor summary toward "Data Analyst"'],
      parsedText: 'Aspiring data analyst. Built Python dashboards, ran A/B tests, wrote complex SQL for reporting.',
    },
    interview: {
      type: 'HR',
      transcript: [
        { question: 'Why data analytics?', answer: 'I love turning messy data into decisions that move a metric.', score: 83, feedback: 'Authentic and specific.' },
        { question: 'Tell me about a time you influenced a decision with data.', answer: 'An A/B test I ran showed a checkout change lifted conversion 6%, so we shipped it.', score: 85, feedback: 'Excellent, metric-driven.' },
        { question: 'How do you handle ambiguous requests?', answer: 'I clarify the decision behind the question, then scope the smallest useful analysis.', score: 80, feedback: 'Strong prioritization.' },
      ],
    },
    jobReadiness: { skillsCoverage: 76, roadmapProgress: 70, resumeScore: 80, interviewScore: 83 },
  },
];

// ---------------------------------------------------------------------------
// Course catalogue (owned by the demo instructor)
// ---------------------------------------------------------------------------
const COURSES = [
  {
    title: 'React from Zero to Hero',
    description: 'Build modern UIs with React, hooks and TanStack Query.',
    coverColor: '#6d5efc',
    lessons: [
      { title: 'Why React?', durationMin: 8 },
      { title: 'Components & Props', durationMin: 14 },
      { title: 'State & Hooks', durationMin: 18 },
      { title: 'Data Fetching with React Query', durationMin: 20 },
    ],
    quiz: {
      title: 'React Fundamentals Quiz',
      questions: [
        { prompt: 'What hook manages local state?', options: ['useState', 'useMemo', 'useRef'], correctIndex: 0 },
        { prompt: 'Lists need a stable…', options: ['style', 'key', 'ref'], correctIndex: 1 },
      ],
    },
  },
  {
    title: 'SQL & Databases Essentials',
    description: 'Query, model and reason about relational data.',
    coverColor: '#20a0f0',
    lessons: [
      { title: 'Relational basics', durationMin: 12 },
      { title: 'SELECT & WHERE', durationMin: 15 },
      { title: 'JOINs in practice', durationMin: 18 },
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
    title: 'Career Foundations for Tech',
    description: 'Resumes, interviews and job search that actually work.',
    coverColor: '#f0a020',
    lessons: [
      { title: 'Building a standout resume', durationMin: 12 },
      { title: 'Acing the behavioral interview', durationMin: 14 },
      { title: 'Running your job search', durationMin: 10 },
    ],
    quiz: {
      title: 'Career Basics Quiz',
      questions: [
        { prompt: 'STAR stands for Situation, Task, Action and…', options: ['Result', 'Review', 'Reason'], correctIndex: 0 },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
async function instantiateGraphRoadmap(userId: string, template: RoadmapGraphTemplate, level: string) {
  const positions = layoutTemplate(template);
  const roadmap = await prisma.roadmap.create({
    data: {
      userId,
      targetRole: template.title,
      level: level as any,
      weeklyHours: 10,
      status: 'ACTIVE',
      estimatedWeeks: template.estimatedWeeks,
      isAiGenerated: false,
      useGraph: true,
      slug: template.slug,
    },
  });

  // Mark the first ~65% of non-optional nodes DONE, the next IN_PROGRESS.
  const relevant = template.nodes.filter((n) => n.type !== 'OPTIONAL');
  const doneCount = Math.floor(relevant.length * 0.65);
  const doneKeys = new Set(relevant.slice(0, doneCount).map((n) => n.key));
  const inProgressKey = relevant[doneCount]?.key;

  const idByKey = new Map<string, string>();
  let order = 0;
  for (const node of template.nodes) {
    const { x, y } = positions.get(node.key)!;
    const status = doneKeys.has(node.key)
      ? 'DONE'
      : node.key === inProgressKey
        ? 'IN_PROGRESS'
        : 'NOT_STARTED';
    const created = await prisma.roadmapNode.create({
      data: {
        roadmapId: roadmap.id,
        key: node.key,
        order: order++,
        title: node.title,
        description: node.description,
        group: node.group,
        type: node.type,
        status: status as any,
        x,
        y,
        resources: {
          create: node.resources.map((r) => ({
            kind: r.kind,
            provider: r.provider,
            url: r.url,
            title: r.title,
            durationMin: r.durationMin,
            lang: r.lang,
          })),
        },
      },
    });
    idByKey.set(node.key, created.id);
  }

  await prisma.nodeEdge.createMany({
    data: template.edges
      .filter((e) => idByKey.has(e.from) && idByKey.has(e.to))
      .map((e) => ({
        roadmapId: roadmap.id,
        fromId: idByKey.get(e.from)!,
        toId: idByKey.get(e.to)!,
        kind: e.kind,
      })),
    skipDuplicates: true,
  });

  return { roadmap, doneCount };
}

/**
 * Attach the LEGACY stage/skill layer to an existing roadmap. The graph view
 * (F4) renders from nodes, but skill-gaps and job-readiness compute from
 * `roadmap.stages` + `stageSkills`, so a "complete" account needs both. Global
 * `Skill` rows are upserted (shared, unique by name) — never deleted.
 */
async function attachLegacyStages(
  roadmapId: string,
  tmpl: (typeof ROADMAP_TEMPLATES)[number],
  progressRatio: number,
) {
  const stageIds: string[] = [];
  for (const s of tmpl.stages) {
    const stage = await prisma.roadmapStage.create({
      data: {
        roadmapId,
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
      },
    });
    stageIds.push(stage.id);

    for (const sk of s.skills) {
      const skill = await prisma.skill.upsert({
        where: { name: sk.name },
        update: { category: sk.category },
        create: { name: sk.name, category: sk.category },
      });
      await prisma.roadmapStageSkill.create({
        data: { stageId: stage.id, skillId: skill.id },
      });
    }
  }

  // Mark the first N stages (and their skills/tasks) DONE for real progress.
  const doneStages = Math.max(1, Math.floor(stageIds.length * progressRatio));
  for (let i = 0; i < doneStages; i++) {
    await prisma.roadmapStage.update({ where: { id: stageIds[i] }, data: { status: 'DONE' } });
    await prisma.roadmapStageSkill.updateMany({ where: { stageId: stageIds[i] }, data: { status: 'DONE' } });
    await prisma.practicalTask.updateMany({ where: { stageId: stageIds[i] }, data: { completed: true } });
  }
}

async function seedProgressEvents(userId: string, nodeDone: number) {
  const events: Prisma.ProgressEventCreateManyInput[] = [];
  // A realistic active streak over the last ~12 days (one gap day).
  for (let d = 0; d < 12; d++) {
    if (d === 5) continue;
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - d);
    const count = 1 + (d % 3);
    for (let i = 0; i < count; i++) {
      const types: Prisma.ProgressEventCreateManyInput['type'][] = [
        'SKILL_DONE',
        'TASK_DONE',
        'LESSON_DONE',
        'STAGE_DONE',
      ];
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

async function createPassedCertificate(userId: string, roadmapId: string, slug: string, recipient: string) {
  const bank = findBank(slug);
  const questionOrder = pickQuestionOrder(bank, QUESTIONS_PER_ATTEMPT);
  const answers = questionOrder.map((qid) => {
    const q = bank.questions.find((x) => x.id === qid)!;
    return { questionId: qid, selectedIndex: q.correctIndex };
  });
  const { score } = scoreAttempt(bank, questionOrder, answers);

  const now = new Date();
  const started = new Date(now.getTime() - 8 * 60 * 1000); // 8 min earlier
  const attempt = await prisma.finalAssessmentAttempt.create({
    data: {
      userId,
      roadmapId,
      role: bank.role,
      version: ASSESSMENT_VERSION,
      questionOrder,
      answers,
      score,
      passThreshold: DEFAULT_PASS_THRESHOLD,
      status: score >= DEFAULT_PASS_THRESHOLD ? 'PASSED' : 'FAILED',
      timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
      startedAt: started,
      submittedAt: now,
    },
  });

  let cert: { serial: string; verifyToken: string } | null = null;
  if (attempt.status === 'PASSED') {
    const created = await prisma.roadmapCertificate.create({
      data: {
        userId,
        roadmapId,
        attemptId: attempt.id,
        role: bank.role,
        recipient,
        score,
        serial: generateSerial(now.getUTCFullYear()),
        verifyToken: generateVerifyToken(),
      },
    });
    cert = { serial: created.serial, verifyToken: created.verifyToken };
  }
  return { score, cert };
}

async function main() {
  console.log('🌱 Additive demo seed (production-safe) …');

  // Dry run: validate imports, scoring and layout for every student without a
  // single DB write. Used to smoke-test the seed before running against prod.
  if (process.env.SEED_DRY_RUN) {
    for (const s of STUDENTS) {
      const { axes, profileCode } = scoreAnswers(buildPsychAnswers(s.psych));
      const template = findGraphTemplate(s.slug) ?? GRAPH_TEMPLATES.find((t) => t.slug === s.slug);
      if (!template) throw new Error(`No graph template for slug "${s.slug}"`);
      const positions = layoutTemplate(template);
      const bank = findBank(s.slug);
      const qOrder = pickQuestionOrder(bank, QUESTIONS_PER_ATTEMPT);
      const answers = qOrder.map((qid) => {
        const q = bank.questions.find((x) => x.id === qid)!;
        return { questionId: qid, selectedIndex: q.correctIndex };
      });
      const { score } = scoreAttempt(bank, qOrder, answers);
      console.log(
        `  DRY ${s.email}: RIASEC ${profileCode} ${JSON.stringify(axes)}, ` +
          `graph "${template.title}" nodes=${template.nodes.length} laid-out=${positions.size}, ` +
          `bank ${bank.role} served=${qOrder.length} score=${score}`,
      );
    }
    console.log('✅ Dry run OK — no writes performed.');
    return;
  }

  const allEmails = [INSTRUCTOR_EMAIL, ...STUDENTS.map((s) => s.email)];

  // Idempotent: remove only OUR demo accounts (cascades wipe their owned rows).
  for (const email of allEmails) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.user.delete({ where: { id: existing.id } });
      console.log(`  ↺ removed existing ${email}`);
    }
  }

  // ---- Instructor + courses ----
  const instructor = await prisma.user.create({
    data: {
      email: INSTRUCTOR_EMAIL,
      name: 'Demo Instructor',
      // Privileged role (can publish public course content) — no one ever logs
      // in as the instructor (it only owns courses via FK), so give it an
      // unknowable random password rather than the shared student demo one.
      passwordHash: hash(randomBytes(18).toString('base64url')),
      emailVerified: true,
      role: 'INSTRUCTOR',
      plan: 'PREMIUM',
      subscription: { create: { plan: 'PREMIUM', status: 'ACTIVE' } },
    },
  });

  const createdCourses: { id: string; lessonIds: string[] }[] = [];
  for (const c of COURSES) {
    const course = await prisma.course.create({
      data: {
        instructorId: instructor.id,
        title: c.title,
        description: c.description,
        coverColor: c.coverColor,
        price: 0,
        published: true,
        lessons: {
          create: c.lessons.map((l, i) => ({
            title: l.title,
            order: i,
            durationMin: l.durationMin,
            videoUrl: 'https://www.youtube.com/embed/PkZNo7MFNFg',
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
      include: { lessons: true },
    });
    createdCourses.push({ id: course.id, lessonIds: course.lessons.map((l) => l.id) });
  }

  // ---- Students ----
  const report: string[] = [];
  for (const s of STUDENTS) {
    const { axes, profileCode } = scoreAnswers(buildPsychAnswers(s.psych));

    const user = await prisma.user.create({
      data: {
        email: s.email,
        name: s.name,
        passwordHash: hash(DEMO_PASSWORD),
        emailVerified: true,
        role: 'STUDENT',
        plan: 'PREMIUM',
        careerProfile: {
          create: {
            onboardingCompleted: true,
            interests: s.profile.interests,
            goals: s.profile.goals,
            experienceLevel: s.level as any,
            currentSkills: s.profile.currentSkills,
            strengths: s.profile.strengths,
            weaknesses: s.profile.weaknesses,
            preferredWorkStyle: s.profile.preferredWorkStyle,
          },
        },
        subscription: { create: { plan: 'PREMIUM', status: 'ACTIVE' } },
      },
    });

    // F1: psych test result
    await prisma.psychTestResult.create({
      data: {
        userId: user.id,
        version: PSYCH_TEST_VERSION,
        answers: buildPsychAnswers(s.psych),
        axes,
        profileCode,
      },
    });

    // Career recommendations
    await prisma.careerRecommendation.createMany({
      data: s.recommendations.map((r) => ({ userId: user.id, ...r })),
    });

    // Resume review
    await prisma.resumeReview.create({
      data: {
        userId: user.id,
        fileUrl: `${s.name.split(' ')[0].toLowerCase()}-resume.pdf`,
        parsedText: s.resume.parsedText,
        score: s.resume.score,
        strengths: s.resume.strengths,
        gaps: s.resume.gaps,
        suggestions: s.resume.suggestions,
      },
    });

    // Mock interview (completed)
    const meanScore = Math.round(
      s.interview.transcript.reduce((a, t) => a + t.score, 0) / s.interview.transcript.length,
    );
    await prisma.mockInterview.create({
      data: {
        userId: user.id,
        type: s.interview.type as any,
        targetRole: findGraphTemplate(s.slug)?.title ?? s.slug,
        transcript: s.interview.transcript,
        feedback:
          meanScore >= 80
            ? 'Excellent — clear, structured, metric-driven answers.'
            : meanScore >= 60
              ? 'Solid performance; tighten examples with more specifics.'
              : 'Keep practicing; add concrete examples and metrics.',
        score: meanScore,
        completed: true,
      },
    });

    // Job readiness
    const b = s.jobReadiness;
    const jrScore = Math.round(
      b.skillsCoverage * 0.35 + b.roadmapProgress * 0.25 + b.resumeScore * 0.2 + b.interviewScore * 0.2,
    );
    await prisma.jobReadiness.create({
      data: {
        userId: user.id,
        targetRole: findGraphTemplate(s.slug)?.title ?? s.slug,
        score: jrScore,
        breakdown: b,
      },
    });

    // F4: graph roadmap with progress
    const template = findGraphTemplate(s.slug) ?? GRAPH_TEMPLATES.find((t) => t.slug === s.slug);
    if (!template) throw new Error(`No graph template for slug "${s.slug}"`);
    const { roadmap, doneCount } = await instantiateGraphRoadmap(user.id, template, s.level);

    // Legacy stage/skill layer on the SAME roadmap (feeds skill-gaps + job-readiness).
    await attachLegacyStages(roadmap.id, pickTemplate(template.title), 0.65);

    // Progress events (streak)
    await seedProgressEvents(user.id, doneCount);

    // F6: passed final assessment + verifiable certificate
    const { score, cert } = await createPassedCertificate(user.id, roadmap.id, s.slug, s.name);

    // LMS: enroll + complete first two courses (with certificate)
    for (const course of createdCourses.slice(0, 2)) {
      await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          progressPct: 100,
          completedLessonIds: course.lessonIds,
        },
      });
      await prisma.certificate.create({
        data: { userId: user.id, courseId: course.id },
      });
    }

    report.push(
      `  ✅ ${s.email}  (${s.name}) — RIASEC ${profileCode}, roadmap "${template.title}" ${doneCount}/${template.nodes.length} done, assessment ${score}%${cert ? `, cert ${cert.serial} /verify/${cert.verifyToken}` : ''}`,
    );
  }

  console.log('\nDemo accounts created:');
  console.log(`  Student password: ${DEMO_PASSWORD}`);
  report.forEach((r) => console.log(r));
  console.log(`\n  Instructor: ${INSTRUCTOR_EMAIL} (role INSTRUCTOR, owns ${createdCourses.length} demo courses)`);
  console.log('\n✅ Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

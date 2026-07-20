import { z } from 'zod';

/**
 * Zod schemas that validate GPT JSON output before it is used or persisted.
 * If GPT returns anything off-shape, `.parse` throws and the caller falls back
 * to the deterministic template — so bad model output never reaches the DB.
 */

const EXPERIENCE_LEVELS = ['BEGINNER', 'JUNIOR', 'MID', 'SENIOR'] as const;
// Must stay in sync with the Prisma `ResourceType` enum — roadmap.service writes
// `resource.type` straight into the DB.
const RESOURCE_TYPES = ['VIDEO', 'ARTICLE', 'YOUTUBE', 'COURSERA', 'UDEMY', 'INTERNAL'] as const;

export const roadmapSkillSchema = z.object({
  name: z.string().min(1).max(80),
  category: z.string().min(1).max(60),
});

export const roadmapResourceSchema = z.object({
  title: z.string().min(1).max(160),
  type: z.enum(RESOURCE_TYPES),
  url: z.string().max(500).default(''),
  provider: z.string().max(80).default(''),
  durationMin: z.coerce.number().int().min(0).max(6000).default(30),
});

export const roadmapTaskSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(500).default(''),
  isAutoChecked: z.coerce.boolean().default(false),
});

export const roadmapStageSchema = z.object({
  order: z.coerce.number().int().min(1),
  title: z.string().min(1).max(120),
  description: z.string().max(600).default(''),
  milestone: z.coerce.boolean().default(false),
  skills: z.array(roadmapSkillSchema).max(12).default([]),
  resources: z.array(roadmapResourceSchema).max(12).default([]),
  tasks: z.array(roadmapTaskSchema).max(12).default([]),
});

export const roadmapSchema = z.object({
  targetRole: z.string().min(1).max(80),
  level: z.enum(EXPERIENCE_LEVELS),
  estimatedWeeks: z.coerce.number().int().min(2).max(104),
  stages: z.array(roadmapStageSchema).min(3).max(10),
});
export type RoadmapJson = z.infer<typeof roadmapSchema>;

export const resumeReviewSchema = z.object({
  score: z.coerce.number().int().min(0).max(100),
  strengths: z.array(z.string().min(1).max(200)).min(1).max(8),
  gaps: z.array(z.string().min(1).max(200)).max(8).default([]),
  suggestions: z.array(z.string().min(1).max(200)).max(8).default([]),
});
export type ResumeReviewJson = z.infer<typeof resumeReviewSchema>;

export const interviewQuestionsSchema = z.object({
  questions: z.array(z.string().min(4).max(300)).min(3).max(6),
});
export type InterviewQuestionsJson = z.infer<typeof interviewQuestionsSchema>;

export const answerEvalSchema = z.object({
  score: z.coerce.number().int().min(0).max(100),
  feedback: z.string().min(1).max(600),
});
export type AnswerEvalJson = z.infer<typeof answerEvalSchema>;

export const insightsSchema = z.object({
  productivity: z.string().min(1).max(400),
  pace: z.string().min(1).max(120),
  growthZones: z.array(z.string().min(1).max(160)).min(1).max(5),
  motivationRisk: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  weeklySummary: z.string().min(1).max(400),
});
export type InsightsJson = z.infer<typeof insightsSchema>;

import { z } from 'zod';
import {
  ExperienceLevel,
  InterviewType,
  Role,
} from './enums';

/* ----------------------------- Auth ----------------------------- */
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2).max(80),
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginDto = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});
export type RefreshDto = z.infer<typeof refreshSchema>;

/* ------------------------- Career Profile ----------------------- */
export const careerProfileSchema = z.object({
  interests: z.array(z.string()).default([]),
  goals: z.string().max(2000).optional().default(''),
  experienceLevel: z.nativeEnum(ExperienceLevel).default(ExperienceLevel.BEGINNER),
  currentSkills: z.array(z.string()).default([]),
  strengths: z.string().max(2000).optional().default(''),
  weaknesses: z.string().max(2000).optional().default(''),
  preferredWorkStyle: z.string().max(500).optional().default(''),
});
export type CareerProfileDto = z.infer<typeof careerProfileSchema>;

/* ------------------------------ Chat ---------------------------- */
export const createChatSessionSchema = z.object({
  title: z.string().max(160).optional(),
});
export type CreateChatSessionDto = z.infer<typeof createChatSessionSchema>;

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(8000),
  /** Optional per-request AI provider/model override (model switcher). */
  provider: z.string().max(40).optional(),
  model: z.string().max(120).optional(),
});
export type SendMessageDto = z.infer<typeof sendMessageSchema>;

/* --------------------------- Recommendations -------------------- */
export const recommendationsRequestSchema = z.object({
  limit: z.number().int().min(1).max(10).optional().default(5),
  /** Locale for generated reason texts (psych-based recommendations). */
  locale: z.enum(['en', 'ru', 'uz']).optional().default('en'),
});
export type RecommendationsRequestDto = z.infer<typeof recommendationsRequestSchema>;

/* ------------------------ Roadmap graph (F4) --------------------- */
export const selectRoadmapSchema = z.object({
  slug: z.string().min(1).max(80),
  level: z.nativeEnum(ExperienceLevel).optional().default(ExperienceLevel.BEGINNER),
  weeklyHours: z.number().int().min(1).max(80).optional().default(10),
});
export type SelectRoadmapDto = z.infer<typeof selectRoadmapSchema>;

export const updateNodeStatusSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'DONE', 'SKIPPED']),
});
export type UpdateNodeStatusDto = z.infer<typeof updateNodeStatusSchema>;

/* ----------------------- Final assessment (F6) ------------------ */
export const startAssessmentSchema = z.object({
  roadmapId: z.string().cuid(),
});
export type StartAssessmentDto = z.infer<typeof startAssessmentSchema>;

export const submitAssessmentSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1).max(24),
        selectedIndex: z.number().int().min(0).max(9),
      }),
    )
    .min(1)
    .max(50),
});
export type SubmitAssessmentDto = z.infer<typeof submitAssessmentSchema>;

/* --------------------------- Psych test ------------------------- */
export const submitPsychTestSchema = z.object({
  version: z.string().min(1).max(40),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1).max(24),
        value: z.number().int().min(1).max(5),
      }),
    )
    .min(1)
    .max(200),
});
export type SubmitPsychTestDto = z.infer<typeof submitPsychTestSchema>;

/* ------------------------------ Roadmap ------------------------- */
export const generateRoadmapSchema = z.object({
  targetRole: z.string().min(2).max(120),
  level: z.nativeEnum(ExperienceLevel).default(ExperienceLevel.BEGINNER),
  weeklyHours: z.number().int().min(1).max(80).default(10),
});
export type GenerateRoadmapDto = z.infer<typeof generateRoadmapSchema>;

export const updateStageStatusSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'DONE']),
});
export type UpdateStageStatusDto = z.infer<typeof updateStageStatusSchema>;

export const addTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional().default(''),
});
export type AddTaskDto = z.infer<typeof addTaskSchema>;

/* ------------------------------ Learning ------------------------ */
export const createEnrollmentSchema = z.object({
  courseId: z.string().cuid(),
});
export type CreateEnrollmentDto = z.infer<typeof createEnrollmentSchema>;

export const submitQuizSchema = z.object({
  answers: z.array(z.number().int()),
});
export type SubmitQuizDto = z.infer<typeof submitQuizSchema>;

/* ------------------------------ Interview ----------------------- */
export const startInterviewSchema = z.object({
  type: z.nativeEnum(InterviewType).default(InterviewType.HR),
  targetRole: z.string().min(2).max(120),
});
export type StartInterviewDto = z.infer<typeof startInterviewSchema>;

export const interviewAnswerSchema = z.object({
  interviewId: z.string().cuid(),
  answer: z.string().min(1).max(4000),
});
export type InterviewAnswerDto = z.infer<typeof interviewAnswerSchema>;

/* --------------------------- Subscription ----------------------- */
export const changePlanSchema = z.object({
  plan: z.enum(['FREE', 'PREMIUM']),
});
export type ChangePlanDto = z.infer<typeof changePlanSchema>;

/* ------------------------------ Admin --------------------------- */
export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;

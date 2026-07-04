/**
 * Enums are defined as `const` objects + union types (rather than TS `enum`)
 * so they remain structurally compatible with Prisma's generated string-literal
 * enum types, while still working with `z.nativeEnum(...)` and value access
 * like `Role.ADMIN`.
 */

export const Role = {
  STUDENT: 'STUDENT',
  INSTRUCTOR: 'INSTRUCTOR',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Plan = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
} as const;
export type Plan = (typeof Plan)[keyof typeof Plan];

export const ExperienceLevel = {
  BEGINNER: 'BEGINNER',
  JUNIOR: 'JUNIOR',
  MID: 'MID',
  SENIOR: 'SENIOR',
} as const;
export type ExperienceLevel = (typeof ExperienceLevel)[keyof typeof ExperienceLevel];

export const RoadmapStatus = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type RoadmapStatus = (typeof RoadmapStatus)[keyof typeof RoadmapStatus];

export const StageStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;
export type StageStatus = (typeof StageStatus)[keyof typeof StageStatus];

export const SkillStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;
export type SkillStatus = (typeof SkillStatus)[keyof typeof SkillStatus];

export const ResourceType = {
  VIDEO: 'VIDEO',
  ARTICLE: 'ARTICLE',
  YOUTUBE: 'YOUTUBE',
  COURSERA: 'COURSERA',
  UDEMY: 'UDEMY',
  INTERNAL: 'INTERNAL',
} as const;
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

export const ProgressEventType = {
  LESSON_DONE: 'LESSON_DONE',
  SKILL_DONE: 'SKILL_DONE',
  TASK_DONE: 'TASK_DONE',
  STAGE_DONE: 'STAGE_DONE',
} as const;
export type ProgressEventType = (typeof ProgressEventType)[keyof typeof ProgressEventType];

export const InterviewType = {
  HR: 'HR',
  TECHNICAL: 'TECHNICAL',
  BEHAVIORAL: 'BEHAVIORAL',
} as const;
export type InterviewType = (typeof InterviewType)[keyof typeof InterviewType];

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  EXPIRED: 'EXPIRED',
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const ChatRole = {
  user: 'user',
  assistant: 'assistant',
} as const;
export type ChatRole = (typeof ChatRole)[keyof typeof ChatRole];

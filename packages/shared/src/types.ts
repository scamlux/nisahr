import {
  ExperienceLevel,
  Plan,
  ResourceType,
  Role,
  SkillStatus,
  StageStatus,
} from './enums';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  plan: Plan;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: PublicUser;
  tokens: AuthTokens;
}

/** Structured payload the AI consultant returns alongside natural text. */
export interface CareerStructuredPayload {
  recommendations?: AiCareerRecommendation[];
  skillGaps?: string[];
  summary?: string;
  /** Live web-search results surfaced by the AI-HR tools (F3). */
  jobs?: JobResult[];
  resources?: WebResource[];
  interviewPrep?: InterviewPrep;
  /** Which tool the intent-router fired for this turn, if any. */
  tool?: 'searchJobs' | 'searchResources' | 'getInterviewPrep';
}

/** A job opening surfaced by the searchJobs tool. */
export interface JobResult {
  title: string;
  company: string;
  location: string;
  /** e.g. "Remote", "Hybrid", "On-site". */
  workMode?: string;
  salary?: string;
  tags: string[];
  url: string;
  source: string;
  postedAt?: string;
}

/** A learning resource surfaced by the searchResources tool. */
export interface WebResource {
  title: string;
  url: string;
  source: string;
  snippet: string;
  kind: 'ARTICLE' | 'VIDEO' | 'COURSE' | 'DOC';
}

/** Interview prep bundle surfaced by the getInterviewPrep tool. */
export interface InterviewPrep {
  role: string;
  questions: string[];
  focusAreas: string[];
  resources: WebResource[];
}

export interface AiCareerRecommendation {
  title: string;
  reason: string;
  entryDifficulty: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedMonths: number;
  score: number; // 0-100
}

export interface AiRoadmapSkill {
  name: string;
  category: string;
}

export interface AiRoadmapResource {
  title: string;
  type: ResourceType;
  url: string;
  provider: string;
  durationMin: number;
}

export interface AiRoadmapTask {
  title: string;
  description: string;
  isAutoChecked: boolean;
}

export interface AiRoadmapStage {
  order: number;
  title: string;
  description: string;
  milestone: boolean;
  skills: AiRoadmapSkill[];
  resources: AiRoadmapResource[];
  tasks: AiRoadmapTask[];
}

export interface AiRoadmap {
  targetRole: string;
  level: ExperienceLevel;
  estimatedWeeks: number;
  stages: AiRoadmapStage[];
}

export interface JobReadinessBreakdown {
  skillsCoverage: number;
  roadmapProgress: number;
  resumeScore: number;
  interviewScore: number;
}

export interface ProgressDashboard {
  roadmapCompletion: number;
  streakDays: number;
  weeklyHours: number;
  monthlyHours: number;
  completedSkills: number;
  completedCourses: number;
  skillHeatmap: { day: string; hours: number }[];
  weeklySeries: { week: string; hours: number }[];
}

export interface SkillNode {
  id: string;
  name: string;
  category: string;
  status: SkillStatus;
}

export interface RoadmapStageView {
  id: string;
  order: number;
  title: string;
  description: string;
  status: StageStatus;
  milestone: boolean;
  skills: SkillNode[];
  completion: number;
}

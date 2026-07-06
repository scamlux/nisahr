import { JobResult, WebResource } from '@careeros/shared';

export const SEARCH_PROVIDER = Symbol('SEARCH_PROVIDER');

export interface JobQuery {
  role: string;
  location?: string;
  limit?: number;
}

export interface ResourceQuery {
  topic: string;
  limit?: number;
}

/**
 * Web-search abstraction for the AI-HR tools (F3). Mirrors the LLM provider
 * contract: every provider reports `available`, and the registry falls back to
 * the always-on mock so the app never hard-fails without API keys.
 */
export interface SearchProvider {
  readonly name: string;
  /** False when required credentials are missing — registry falls back to mock. */
  readonly available: boolean;
  searchJobs(query: JobQuery): Promise<JobResult[]>;
  searchResources(query: ResourceQuery): Promise<WebResource[]>;
}

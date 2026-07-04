export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmChatOptions {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

/** Low-level LLM abstraction. Swap implementations via AI_PROVIDER env. */
export interface LlmProvider {
  readonly name: string;
  chat(messages: LlmMessage[], options?: LlmChatOptions): Promise<string>;
}

export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

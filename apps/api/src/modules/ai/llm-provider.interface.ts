export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmChatOptions {
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  /** Override the provider's default model for this request. */
  model?: string;
}

/** Low-level LLM abstraction. Implementations are registered in AiRegistryService. */
export interface LlmProvider {
  readonly name: string;
  /** True when the provider can serve requests (credentials present, or keyless like mock). */
  readonly available: boolean;
  chat(messages: LlmMessage[], options?: LlmChatOptions): Promise<string>;
}

export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

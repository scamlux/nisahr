import { Injectable } from '@nestjs/common';
import { LlmProvider } from './llm-provider.interface';
import { OpenAiLlmProvider } from './providers/openai-compatible.provider';

export interface AiModelOption {
  id: string;
  label: string;
}

export interface AiProviderInfo {
  id: string;
  label: string;
  available: boolean;
  defaultModel: string;
  models: AiModelOption[];
}

/** OpenAI model menu. GPT is the only supported provider. */
const OPENAI_MODELS: AiModelOption[] = [
  { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
];

/**
 * Single-provider registry (OpenAI). Kept as a thin seam so AiService and the
 * `/ai/models` endpoint have one place to resolve the provider and its models.
 */
@Injectable()
export class AiRegistryService {
  constructor(private readonly openai: OpenAiLlmProvider) {}

  get defaultProviderId(): string {
    return 'openai';
  }

  /** Only OpenAI exists; the `requested` arg is ignored (kept for call-site compat). */
  resolve(_requested?: string): LlmProvider {
    return this.openai;
  }

  defaultModelFor(_providerId?: string): string {
    return (this.modelEnv || OPENAI_MODELS[0].id);
  }

  private get modelEnv(): string {
    return process.env.OPENAI_MODEL ?? '';
  }

  /** Catalog for the UI (now a single OpenAI entry). */
  catalog(): { default: { provider: string; model: string }; providers: AiProviderInfo[] } {
    return {
      default: { provider: 'openai', model: this.defaultModelFor() },
      providers: [
        {
          id: 'openai',
          label: 'OpenAI',
          available: this.openai.available,
          defaultModel: this.defaultModelFor(),
          models: OPENAI_MODELS,
        },
      ],
    };
  }
}

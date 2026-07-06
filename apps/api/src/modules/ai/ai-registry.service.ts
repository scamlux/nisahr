import { Injectable } from '@nestjs/common';
import { LlmProvider } from './llm-provider.interface';
import { MockLlmProvider } from './providers/mock-llm.provider';
import { GeminiLlmProvider } from './providers/gemini-llm.provider';
import {
  GroqLlmProvider,
  OpenAiLlmProvider,
  OpenRouterLlmProvider,
} from './providers/openai-compatible.provider';

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

/** Curated, per-provider model menus for the UI switcher. */
const MODEL_MENU: Record<string, { label: string; models: AiModelOption[] }> = {
  mock: {
    label: 'CareerOS Mock',
    models: [{ id: 'careeros-mock', label: 'Mock (offline, free)' }],
  },
  openai: {
    label: 'OpenAI',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
    ],
  },
  gemini: {
    label: 'Google Gemini',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
  },
  groq: {
    label: 'Groq',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (instant)' },
    ],
  },
  openrouter: {
    label: 'OpenRouter',
    models: [
      { id: 'openrouter/auto', label: 'Auto (best available)' },
      { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' },
      { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
    ],
  },
};

/**
 * Provider registry with per-request selection.
 * Never hard-fails: an unknown or unavailable provider silently resolves to
 * the env default, and finally to mock — the app always answers.
 */
@Injectable()
export class AiRegistryService {
  private readonly providers: Map<string, LlmProvider>;

  constructor(
    private readonly mock: MockLlmProvider,
    openai: OpenAiLlmProvider,
    gemini: GeminiLlmProvider,
    groq: GroqLlmProvider,
    openrouter: OpenRouterLlmProvider,
  ) {
    this.providers = new Map<string, LlmProvider>(
      [mock, openai, gemini, groq, openrouter].map((p) => [p.name, p]),
    );
  }

  get defaultProviderId(): string {
    const wanted = (process.env.AI_PROVIDER ?? 'mock').toLowerCase();
    const provider = this.providers.get(wanted);
    return provider?.available ? provider.name : 'mock';
  }

  /** Resolve a provider by id; falls back to env default, then mock. */
  resolve(requested?: string): LlmProvider {
    if (requested) {
      const p = this.providers.get(requested.toLowerCase());
      if (p?.available) return p;
    }
    return this.providers.get(this.defaultProviderId) ?? this.mock;
  }

  defaultModelFor(providerId: string): string {
    return MODEL_MENU[providerId]?.models[0]?.id ?? 'careeros-mock';
  }

  /** Catalog for the UI model switcher. */
  catalog(): { default: { provider: string; model: string }; providers: AiProviderInfo[] } {
    const providers = [...this.providers.values()].map((p) => ({
      id: p.name,
      label: MODEL_MENU[p.name]?.label ?? p.name,
      available: p.available,
      defaultModel: this.defaultModelFor(p.name),
      models: MODEL_MENU[p.name]?.models ?? [],
    }));
    const def = this.defaultProviderId;
    return {
      default: { provider: def, model: this.defaultModelFor(def) },
      providers,
    };
  }
}

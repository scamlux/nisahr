import { Injectable, Logger } from '@nestjs/common';
import { LlmChatOptions, LlmMessage, LlmProvider } from '../llm-provider.interface';

/**
 * Base class for every OpenAI-compatible Chat Completions API.
 * OpenAI, Groq and OpenRouter all speak this dialect — subclasses only
 * declare their env keys, base URL and default model.
 */
export abstract class OpenAiCompatibleProvider implements LlmProvider {
  abstract readonly name: string;
  protected abstract readonly apiKeyEnv: string;
  protected abstract readonly defaultBaseUrl: string;
  protected abstract readonly defaultModel: string;
  /** Optional env overrides (e.g. OPENAI_BASE_URL / OPENAI_MODEL). */
  protected baseUrlEnv?: string;
  protected modelEnv?: string;
  protected extraHeaders: Record<string, string> = {};

  private readonly logger = new Logger(OpenAiCompatibleProvider.name);

  get available(): boolean {
    return Boolean(process.env[this.apiKeyEnv]);
  }

  protected get envModel(): string {
    return (this.modelEnv && process.env[this.modelEnv]) || this.defaultModel;
  }

  async chat(messages: LlmMessage[], options?: LlmChatOptions): Promise<string> {
    const apiKey = process.env[this.apiKeyEnv];
    if (!apiKey) {
      throw new Error(`${this.apiKeyEnv} is not set`);
    }
    const baseUrl =
      (this.baseUrlEnv && process.env[this.baseUrlEnv]) || this.defaultBaseUrl;
    const model = options?.model ?? this.envModel;

    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...this.extraHeaders,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1200,
        ...(options?.json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`${this.name} error ${res.status}: ${text.slice(0, 300)}`);
      throw new Error(`${this.name} request failed: ${res.status}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? '';
  }
}

/** OpenAI (or any compatible base URL via OPENAI_BASE_URL) — the only provider. */
@Injectable()
export class OpenAiLlmProvider extends OpenAiCompatibleProvider {
  readonly name = 'openai';
  protected readonly apiKeyEnv = 'OPENAI_API_KEY';
  protected readonly defaultBaseUrl = 'https://api.openai.com/v1';
  protected readonly defaultModel = 'gpt-4o-mini';
  protected baseUrlEnv = 'OPENAI_BASE_URL';
  protected modelEnv = 'OPENAI_MODEL';
}

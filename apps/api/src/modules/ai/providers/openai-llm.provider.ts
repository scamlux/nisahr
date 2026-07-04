import { Injectable, Logger } from '@nestjs/common';
import { LlmChatOptions, LlmMessage, LlmProvider } from '../llm-provider.interface';

/** OpenAI-compatible Chat Completions provider (works with any compatible base URL). */
@Injectable()
export class OpenAiLlmProvider implements LlmProvider {
  readonly name = 'openai';
  private readonly logger = new Logger('OpenAiLlmProvider');

  async chat(messages: LlmMessage[], options?: LlmChatOptions): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
    const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
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
      this.logger.error(`OpenAI error ${res.status}: ${text}`);
      throw new Error(`OpenAI request failed: ${res.status}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? '';
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { LlmChatOptions, LlmMessage, LlmProvider } from '../llm-provider.interface';

/** Google Gemini via the native generateContent REST API. */
@Injectable()
export class GeminiLlmProvider implements LlmProvider {
  readonly name = 'gemini';
  private readonly logger = new Logger('GeminiLlmProvider');

  get available(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async chat(messages: LlmMessage[], options?: LlmChatOptions): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    const model = options?.model ?? process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

    // Gemini separates system instructions from the user/model turn list.
    const system = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: system || 'Hello' }] });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        contents,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 1200,
          ...(options?.json ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`gemini error ${res.status}: ${text.slice(0, 300)}`);
      throw new Error(`gemini request failed: ${res.status}`);
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return (
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
    );
  }
}

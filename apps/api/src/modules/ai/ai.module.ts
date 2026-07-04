import { Global, Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { LLM_PROVIDER } from './llm-provider.interface';
import { MockLlmProvider } from './providers/mock-llm.provider';
import { OpenAiLlmProvider } from './providers/openai-llm.provider';

@Global()
@Module({
  providers: [
    MockLlmProvider,
    OpenAiLlmProvider,
    {
      provide: LLM_PROVIDER,
      inject: [MockLlmProvider, OpenAiLlmProvider],
      useFactory: (mock: MockLlmProvider, openai: OpenAiLlmProvider) => {
        const provider = (process.env.AI_PROVIDER ?? 'mock').toLowerCase();
        return provider === 'openai' ? openai : mock;
      },
    },
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}

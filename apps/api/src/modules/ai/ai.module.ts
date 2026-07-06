import { Global, Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiRegistryService } from './ai-registry.service';
import { LLM_PROVIDER } from './llm-provider.interface';
import { MockLlmProvider } from './providers/mock-llm.provider';
import { GeminiLlmProvider } from './providers/gemini-llm.provider';
import {
  GroqLlmProvider,
  OpenAiLlmProvider,
  OpenRouterLlmProvider,
} from './providers/openai-compatible.provider';

@Global()
@Module({
  controllers: [AiController],
  providers: [
    MockLlmProvider,
    OpenAiLlmProvider,
    GeminiLlmProvider,
    GroqLlmProvider,
    OpenRouterLlmProvider,
    AiRegistryService,
    {
      // Back-compat token: resolves to the env-default provider.
      provide: LLM_PROVIDER,
      inject: [AiRegistryService],
      useFactory: (registry: AiRegistryService) => registry.resolve(),
    },
    AiService,
  ],
  exports: [AiService, AiRegistryService],
})
export class AiModule {}

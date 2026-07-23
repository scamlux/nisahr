import { Global, Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiRegistryService } from './ai-registry.service';
import { LLM_PROVIDER } from './llm-provider.interface';
import { OpenAiLlmProvider } from './providers/openai-compatible.provider';

@Global()
@Module({
  controllers: [AiController],
  providers: [
    OpenAiLlmProvider,
    AiRegistryService,
    {
      // Back-compat token: resolves to the (only) OpenAI provider.
      provide: LLM_PROVIDER,
      inject: [AiRegistryService],
      useFactory: (registry: AiRegistryService) => registry.resolve(),
    },
    AiService,
  ],
  exports: [AiService, AiRegistryService],
})
export class AiModule {}

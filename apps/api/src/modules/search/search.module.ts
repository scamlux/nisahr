import { Global, Module } from '@nestjs/common';
import { MockSearchProvider } from './providers/mock-search.provider';
import { SearchRegistryService } from './search-registry.service';
import { SearchToolsService } from './search-tools.service';
import { SearchController } from './search.controller';

/**
 * Web-search stack for the AI-HR tools (F3). Global so AiService can compose the
 * tools without import wiring. Zero-key by default: only the mock provider is
 * required; real providers activate when their API keys are present.
 */
@Global()
@Module({
  controllers: [SearchController],
  providers: [MockSearchProvider, SearchRegistryService, SearchToolsService],
  exports: [SearchRegistryService, SearchToolsService],
})
export class SearchModule {}

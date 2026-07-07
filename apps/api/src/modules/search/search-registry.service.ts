import { Injectable } from '@nestjs/common';
import { SearchProvider } from './search-provider.interface';
import { MockSearchProvider } from './providers/mock-search.provider';
import {
  BraveSearchProvider,
  SearxngSearchProvider,
  TavilySearchProvider,
} from './providers/http-search.provider';

export interface SearchProviderInfo {
  id: string;
  available: boolean;
}

/**
 * Search-provider registry. Mirrors {@link AiRegistryService}: resolves the
 * provider named by SEARCH_PROVIDER, and silently falls back to the always-on
 * mock when the requested provider is unknown or missing credentials.
 */
@Injectable()
export class SearchRegistryService {
  private readonly providers: Map<string, SearchProvider>;

  constructor(private readonly mock: MockSearchProvider) {
    const all: SearchProvider[] = [
      mock,
      new TavilySearchProvider(),
      new BraveSearchProvider(),
      new SearxngSearchProvider(),
    ];
    this.providers = new Map(all.map((p) => [p.name, p]));
  }

  get activeProviderId(): string {
    const wanted = (process.env.SEARCH_PROVIDER ?? 'mock').toLowerCase();
    const p = this.providers.get(wanted);
    return p?.available ? p.name : 'mock';
  }

  /** Active search provider (env-selected), guaranteed non-null (mock fallback). */
  resolve(): SearchProvider {
    return this.providers.get(this.activeProviderId) ?? this.mock;
  }

  catalog(): { active: string; providers: SearchProviderInfo[] } {
    return {
      active: this.activeProviderId,
      providers: [...this.providers.values()].map((p) => ({ id: p.name, available: p.available })),
    };
  }
}

'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './ui/toast';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 15_000 },
        },
      }),
  );

  return (
    <ThemeProvider>
      <I18nProvider>
        <QueryClientProvider client={client}>
          {children}
          <Toaster />
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

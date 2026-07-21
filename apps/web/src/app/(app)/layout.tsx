import type { Metadata } from 'next';
import { AppShell } from '@/components/app/app-shell';

// Authenticated app surface — keep it out of search indexes entirely.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

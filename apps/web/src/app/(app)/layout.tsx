'use client';

import '@xyflow/react/dist/style.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/app/sidebar';
import { MobileNav } from '@/components/app/mobile-nav';
import { useAuth } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuth((s) => s.accessToken);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // store rehydrates from localStorage on mount
    const t = useAuth.getState().accessToken;
    if (!t) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready || !token) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="relative flex-1 pb-20 lg:pb-0">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="aurora-blob left-[30%] top-[-15%] h-[30rem] w-[30rem] bg-primary/10" />
        </div>
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

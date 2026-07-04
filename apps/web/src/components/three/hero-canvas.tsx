'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useReducedMotion, useWebGLAvailable, useMounted } from '@/lib/hooks';

const CareerOrb = dynamic(() => import('./career-orb'), { ssr: false });

/** Static, dependency-free fallback for reduced-motion / no-WebGL devices. */
function StaticFallback() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary via-primary/40 to-accent blur-2xl opacity-70" />
      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-surface/40 backdrop-blur-xl" />
    </div>
  );
}

export function HeroCanvas() {
  const reduced = useReducedMotion();
  const webgl = useWebGLAvailable();
  const mounted = useMounted();

  if (!mounted) return <div className="h-full w-full" />;
  if (reduced || !webgl) return <StaticFallback />;

  return (
    <Suspense fallback={<StaticFallback />}>
      <CareerOrb />
    </Suspense>
  );
}

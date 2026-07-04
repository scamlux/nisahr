'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { PathNode } from './roadmap-path';
import { useReducedMotion, useWebGLAvailable, useMounted } from '@/lib/hooks';

const RoadmapPath = dynamic(() => import('./roadmap-path'), { ssr: false });

/** 2D fallback path — a horizontal connected-node strip. */
function FallbackPath({ nodes }: { nodes: PathNode[] }) {
  return (
    <div className="flex h-full items-center gap-2 overflow-x-auto px-6">
      {nodes.map((n, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className={
                n.status === 'DONE'
                  ? 'h-5 w-5 rounded-full bg-success'
                  : n.completion > 0
                    ? 'h-5 w-5 rounded-full bg-primary'
                    : 'h-5 w-5 rounded-full bg-border'
              }
            />
            <span className="max-w-[90px] text-center text-[11px] text-muted">{n.title}</span>
          </div>
          {i < nodes.length - 1 && <div className="h-0.5 w-10 bg-border" />}
        </div>
      ))}
    </div>
  );
}

export function RoadmapPathView({ nodes }: { nodes: PathNode[] }) {
  const reduced = useReducedMotion();
  const webgl = useWebGLAvailable();
  const mounted = useMounted();

  if (!mounted) return <div className="h-full w-full" />;
  if (reduced || !webgl) return <FallbackPath nodes={nodes} />;

  return (
    <Suspense fallback={<FallbackPath nodes={nodes} />}>
      <RoadmapPath nodes={nodes} />
    </Suspense>
  );
}

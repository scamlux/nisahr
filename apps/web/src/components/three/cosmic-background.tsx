'use client';

import dynamic from 'next/dynamic';
import { Component, Suspense, type ReactNode } from 'react';
import { useReducedMotion, useWebGLAvailable, useMounted } from '@/lib/hooks';
import { useTheme } from '@/lib/theme';

const CosmicScene = dynamic(() => import('./cosmic-scene'), { ssr: false });

/** Static, dependency-free wash for reduced-motion / no-WebGL / SSR / errors. */
function StaticFallback() {
  return <div className="hero-wash absolute inset-0" />;
}

/** If WebGL context or shader compilation fails at runtime, show the wash. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <StaticFallback /> : this.props.children;
  }
}

/**
 * Ambient cosmic vortex behind the hero. Fades out toward the bottom so it
 * blends into the page. Degrades to a calm gradient when motion/WebGL is off
 * or if the WebGL scene throws.
 */
export function CosmicBackground() {
  const reduced = useReducedMotion();
  const webgl = useWebGLAvailable();
  const mounted = useMounted();
  const { theme } = useTheme();

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to bottom, #000 55%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 55%, transparent 100%)',
      }}
    >
      {!mounted || reduced || !webgl ? (
        <StaticFallback />
      ) : (
        <SceneBoundary>
          <Suspense fallback={<StaticFallback />}>
            <CosmicScene dark={theme === 'dark'} />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}

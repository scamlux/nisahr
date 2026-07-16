'use client';

import { useEffect, useRef } from 'react';

/**
 * Ambient dot-grid background with a pointer-following spotlight.
 *
 * The visuals live entirely in CSS (`.dot-grid` in globals.css); this component
 * only feeds the pointer position into the `--mx` / `--my` custom properties,
 * throttled to one write per animation frame. It renders nothing visible on the
 * server, honours `prefers-reduced-motion` (no listener → static centred glow),
 * and skips work on touch-only devices where there is no hover pointer.
 */
export function InteractiveGrid() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduced || !finePointer) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        el.style.setProperty('--mx', `${x}px`);
        el.style.setProperty('--my', `${y}px`);
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="dot-grid" aria-hidden>
      <div className="dot-grid-glow" />
    </div>
  );
}

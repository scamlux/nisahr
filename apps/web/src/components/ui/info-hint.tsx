'use client';

import { Info } from 'lucide-react';

/**
 * Small inline "?" affordance that explains jargon (RIASEC, readiness score…).
 * Shows a short plain-language tooltip on hover and keyboard focus; the text is
 * also exposed to assistive tech via aria-label. Purely presentational.
 */
export function InfoHint({ text }: { text: string }) {
  return (
    <span
      tabIndex={0}
      role="note"
      aria-label={text}
      className="group relative inline-flex cursor-help items-center align-middle focus:outline-none"
    >
      <Info className="h-3.5 w-3.5 text-muted transition-colors group-hover:text-fg" aria-hidden />
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-lg border border-border bg-surface p-2.5 text-xs font-normal leading-snug text-muted opacity-0 shadow-soft transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

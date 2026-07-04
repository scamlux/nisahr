'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function LangSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale, locales, meta } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface/60 px-2.5 text-sm font-medium text-muted transition-all hover:text-fg hover:bg-surface-2 active:scale-95"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="glass absolute right-0 z-50 mt-2 w-44 origin-top-right animate-fade-up overflow-hidden rounded-xl p-1"
        >
          {locales.map((l) => {
            const active = l === locale;
            return (
              <button
                key={l}
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                  active ? 'bg-primary/12 text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
                )}
              >
                <span className="text-base leading-none">{meta[l].flag}</span>
                <span className="flex-1 text-left">{meta[l].native}</span>
                {active && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

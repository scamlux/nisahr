'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Cpu, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAiModel } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface AiModelOption {
  id: string;
  label: string;
}

interface AiProviderInfo {
  id: string;
  label: string;
  available: boolean;
  defaultModel: string;
  models: AiModelOption[];
}

interface Catalog {
  default: { provider: string; model: string };
  providers: AiProviderInfo[];
}

/**
 * Compact AI model picker for the chat header. Groups models by provider;
 * providers without credentials are visible but locked, so users learn what
 * the platform supports without ever hitting an error.
 */
export function ModelSwitcher() {
  const { t } = useI18n();
  const { provider, model, setModel } = useAiModel();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { data: catalog } = useQuery<Catalog>({
    queryKey: ['ai-models'],
    queryFn: async () => (await api.get('/ai/models')).data,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  if (!catalog) return null;

  const activeProvider = provider ?? catalog.default.provider;
  const activeModel = model ?? catalog.default.model;
  const activeInfo = catalog.providers.find((p) => p.id === activeProvider);
  const activeLabel =
    activeInfo?.models.find((m) => m.id === activeModel)?.label ?? activeModel;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.pages.home.modelLabel}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-9 items-center gap-2 rounded-full border border-border bg-surface-2/60 px-3 text-xs font-medium text-muted',
          'transition-all hover:border-primary/40 hover:text-fg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          open && 'border-primary/40 text-fg',
        )}
      >
        <Cpu className="h-3.5 w-3.5 text-primary" />
        <span className="max-w-[140px] truncate">{activeLabel}</span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label={t.pages.home.modelLabel}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-11 z-40 max-h-96 w-72 overflow-y-auto rounded-2xl border border-border bg-surface p-2 shadow-soft"
          >
            {catalog.providers.map((p) => (
              <div key={p.id} className="mb-1 last:mb-0">
                <div className="flex items-center justify-between px-2 pb-1 pt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {p.label}
                  </span>
                  {!p.available && (
                    <span className="flex items-center gap-1 text-[10px] text-muted">
                      <Lock className="h-3 w-3" /> {t.pages.home.modelUnavailable}
                    </span>
                  )}
                </div>
                {p.models.map((m) => {
                  const selected = p.id === activeProvider && m.id === activeModel;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={!p.available}
                      onClick={() => {
                        setModel(p.id, m.id);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-sm transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                        p.available
                          ? 'text-fg hover:bg-surface-2'
                          : 'cursor-not-allowed text-muted opacity-50',
                        selected && 'bg-primary/10 text-primary',
                      )}
                    >
                      <span className="truncate">{m.label}</span>
                      {selected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

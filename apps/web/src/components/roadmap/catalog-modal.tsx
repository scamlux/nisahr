'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, Layers, Loader2, Map, X } from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { useI18n } from '@/lib/i18n';
import { CardSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CatalogItem {
  slug: string;
  title: string;
  description: { en: string; ru: string; uz: string };
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedWeeks: number;
  tags: string[];
  nodeCount: number;
  topicCount: number;
}

/** F2: ready-made roadmap catalog — pick a path, become the active roadmap. */
export function CatalogModal({
  onClose,
  onSelected,
}: {
  onClose: () => void;
  onSelected: (roadmapId: string) => void;
}) {
  const { t, locale } = useI18n();
  const tr = t.pages.roadmap;
  const [selecting, setSelecting] = useState<string | null>(null);

  const { data: catalog, isLoading } = useQuery<CatalogItem[]>({
    queryKey: ['roadmap-catalog'],
    queryFn: async () => (await api.get('/roadmaps/catalog')).data,
    staleTime: 5 * 60 * 1000,
  });

  async function select(slug: string) {
    setSelecting(slug);
    try {
      const { data } = await api.post('/roadmaps/select', { slug });
      toast.success(tr.selectedToast);
      onSelected(data.id);
      onClose();
    } catch (err) {
      toast.error(apiError(err, tr.toastGenerateError));
    } finally {
      setSelecting(null);
    }
  }

  const difficultyStyle: Record<CatalogItem['difficulty'], string> = {
    EASY: 'border-success/30 bg-success/10 text-success',
    MEDIUM: 'border-warning/30 bg-warning/10 text-warning',
    HARD: 'border-danger/30 bg-danger/10 text-danger',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-7"
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <Map className="h-5 w-5 text-primary" /> {tr.catalogTitle}
          </h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-5 text-sm text-muted">{tr.catalogSubtitle}</p>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(catalog ?? []).map((item, i) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                className="card group flex flex-col p-5 transition-all hover:border-primary/40 hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold">{item.title}</h3>
                  <span className={cn('chip shrink-0 text-[10px]', difficultyStyle[item.difficulty])}>
                    {item.difficulty}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-muted">
                  {item.description[locale as 'en' | 'ru' | 'uz'] ?? item.description.en}
                </p>
                <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" /> {item.nodeCount} {tr.nodesLabel}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> ~{item.estimatedWeeks} {tr.weeksApprox}
                  </span>
                </div>
                <button
                  className="btn-primary mt-4 w-full !py-2 text-sm"
                  disabled={selecting !== null}
                  onClick={() => select(item.slug)}
                >
                  {selecting === item.slug ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    tr.selectButton
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

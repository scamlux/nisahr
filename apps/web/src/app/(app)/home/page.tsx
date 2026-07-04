'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Sparkles, Target, TrendingUp, Compass } from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import type { CareerStructuredPayload } from '@careeros/shared';

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  structuredPayload?: CareerStructuredPayload | null;
}

export default function HomePage() {
  const { t } = useI18n();
  const user = useAuth((s) => s.user);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    t.pages.home.suggestion1,
    t.pages.home.suggestion2,
    t.pages.home.suggestion3,
    t.pages.home.suggestion4,
  ];

  useEffect(() => {
    (async () => {
      try {
        const sessions = await api.get('/chat/sessions');
        if (sessions.data.length > 0) {
          const sid = sessions.data[0].id;
          setSessionId(sid);
          const full = await api.get(`/chat/sessions/${sid}`);
          setMessages(full.data.messages ?? []);
        } else {
          const created = await api.post('/chat/sessions', {});
          setSessionId(created.data.id);
        }
      } catch (err) {
        toast.error(apiError(err, t.pages.home.toastLoadFailed));
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  async function send(text: string) {
    if (!text.trim() || !sessionId || typing) return;
    setInput('');
    const userMsg: Msg = { id: `tmp-${Date.now()}`, role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    setTyping(true);
    try {
      const { data } = await api.post(`/chat/sessions/${sessionId}/messages`, { content: text });
      setMessages((m) => [...m, data]);
    } catch (err) {
      toast.error(apiError(err, t.pages.home.toastMessageFailed));
    } finally {
      setTyping(false);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col px-4 py-6 lg:px-8">
      {/* header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-fg">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold leading-tight">{t.pages.home.headerTitle}</h1>
          <p className="text-xs text-muted">{t.pages.home.headerSubtitle}</p>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="card flex-1 space-y-5 overflow-y-auto p-5">
        {empty && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary"
            >
              <Compass className="h-8 w-8" />
            </motion.div>
            <h2 className="font-display text-xl font-semibold">
              {t.pages.home.greetingHi} {user?.name.split(' ')[0]}, {t.pages.home.greetingRest}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted">
              {t.pages.home.heroSubtitle}
            </p>
            <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-border bg-surface-2/50 p-3 text-left text-sm text-muted transition-all hover:border-primary/40 hover:text-fg"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className={cn('max-w-[85%]', m.role === 'user' ? 'order-2' : '')}>
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'bg-primary text-primary-fg'
                      : 'border border-border bg-surface-2/60',
                  )}
                >
                  {m.content}
                </div>
                {m.structuredPayload && <StructuredPanel payload={m.structuredPayload} />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-surface-2/60 px-4 py-3.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-muted"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex items-center gap-2"
      >
        <input
          className="input flex-1"
          placeholder={t.pages.home.composerPlaceholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn-primary aspect-square !px-0 !py-0 h-11 w-11" disabled={typing || !input.trim()}>
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function StructuredPanel({ payload }: { payload: CareerStructuredPayload }) {
  const { t } = useI18n();
  // CSS animation (not Framer) so the panel always reveals, even when its
  // message is loaded from history rather than mounted live.
  return (
    <div className="mt-3 space-y-3 animate-fade-up">
      {payload.recommendations && payload.recommendations.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <Target className="h-3.5 w-3.5" /> {t.pages.home.recommendedRoles}
          </p>
          {payload.recommendations.map((r) => (
            <div key={r.title} className="rounded-xl border border-border bg-surface/60 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{r.title}</span>
                <span className="chip border-primary/30 bg-primary/10 text-primary">{Math.round(r.score)}% {t.pages.home.matchSuffix}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{r.reason}</p>
              <div className="mt-2 flex gap-3 text-[11px] text-muted">
                <span>~{r.estimatedMonths} {t.pages.home.monthsSuffix}</span>
                <span>{t.pages.home.entryLabel} {r.entryDifficulty}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {payload.skillGaps && payload.skillGaps.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <TrendingUp className="h-3.5 w-3.5" /> {t.pages.home.skillGapsToClose}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {payload.skillGaps.map((g) => (
              <span key={g} className="chip border-warning/30 bg-warning/10 text-warning">{g}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

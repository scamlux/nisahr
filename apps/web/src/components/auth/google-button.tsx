'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { toast } from '@/components/ui/toast';
import { useI18n } from '@/lib/i18n';

interface GoogleConfig {
  configured: boolean;
  devBypass: boolean;
  authUrl: string | null;
}

/** Google "G" logo (inline SVG so it works under the strict CSP / offline). */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

/**
 * F7: "Continue with Google".
 *  - Real OAuth2 redirect when GOOGLE_CLIENT_ID/SECRET are configured.
 *  - Otherwise a zero-key demo that asks for a name + email so EACH person gets
 *    their OWN persistent account. (Previously every demo sign-in shared one
 *    hardcoded "Google Demo" identity, so users saw each other's data — fixed.)
 */
export function GoogleButton() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const { t } = useI18n();
  const tr = t.pages.auth;
  const [cfg, setCfg] = useState<GoogleConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [askDemo, setAskDemo] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    api.get<GoogleConfig>('/auth/google/config').then((r) => setCfg(r.data)).catch(() => setCfg(null));
  }, []);

  function onClick() {
    if (cfg?.configured && cfg.authUrl) {
      // Real Google — hand off to the OAuth consent screen.
      window.location.href = cfg.authUrl;
      return;
    }
    // Zero-key demo: collect a per-person identity so accounts don't collide.
    setAskDemo(true);
  }

  async function submitDemo(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google/mock', {
        email: email.trim().toLowerCase(),
        name: name.trim() || email.split('@')[0],
      });
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      const me = await api.get('/auth/me');
      router.push(me.data.onboardingCompleted ? '/home' : '/onboarding');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface py-3 text-sm font-medium transition-all hover:border-primary/40 hover:bg-surface-2 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        {tr.continueWithGoogle}
      </button>
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-border" /> {tr.orDivider} <span className="h-px flex-1 bg-border" />
      </div>

      <AnimatePresence>
        {askDemo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => !loading && setAskDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-sm rounded-3xl p-6"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                  <GoogleIcon /> {tr.googleDemoTitle}
                </h2>
                <button type="button" onClick={() => setAskDemo(false)} className="text-muted hover:text-fg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mb-4 text-sm text-muted">{tr.googleDemoBody}</p>
              <form onSubmit={submitDemo} className="space-y-3">
                <input
                  className="input" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={tr.googleDemoName} autoFocus
                />
                <input
                  className="input" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder={tr.googleDemoEmail}
                />
                <button className="btn-primary w-full py-3" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : tr.googleDemoContinue}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

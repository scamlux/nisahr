'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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

/** F7: "Continue with Google". Real OAuth redirect when configured, else the
 *  zero-key mock sign-in for the demo. */
export function GoogleButton() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const { t } = useI18n();
  const [cfg, setCfg] = useState<GoogleConfig | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<GoogleConfig>('/auth/google/config').then((r) => setCfg(r.data)).catch(() => setCfg(null));
  }, []);

  async function onClick() {
    if (cfg?.configured && cfg.authUrl) {
      window.location.href = cfg.authUrl;
      return;
    }
    // Zero-key demo: mint a session for a demo Google identity.
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google/mock', {
        email: 'google.demo@careeros.dev',
        name: 'Google Demo',
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
        {t.pages.auth.continueWithGoogle}
      </button>
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-border" /> {t.pages.auth.orDivider} <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

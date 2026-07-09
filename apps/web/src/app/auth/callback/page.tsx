'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { toast } from '@/components/ui/toast';
import { useI18n } from '@/lib/i18n';

/**
 * F7: Google OAuth2 redirect target. Google sends the user here with `?code=…`;
 * we exchange it server-side for a real session. This is the `GOOGLE_REDIRECT_URI`
 * that must be registered in the Google Cloud console (e.g. https://<site>/auth/callback).
 */
function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuth((s) => s.setAuth);
  const { t } = useI18n();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard against React 18 double-invoke
    ran.current = true;

    const code = params.get('code');
    const error = params.get('error');
    if (error || !code) {
      toast.error(t.pages.auth.callbackFailed);
      router.replace('/login');
      return;
    }

    (async () => {
      try {
        const { data } = await api.post('/auth/google/callback', {
          code,
          redirectUri: `${window.location.origin}/auth/callback`,
        });
        setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
        const me = await api.get('/auth/me');
        router.replace(me.data.onboardingCompleted ? '/home' : '/onboarding');
      } catch (err) {
        toast.error(apiError(err, t.pages.auth.callbackFailed));
        router.replace('/login');
      }
    })();
  }, [params, router, setAuth, t]);

  return (
    <div className="grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-3 text-muted">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">{t.pages.auth.callbackSigningIn}</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}

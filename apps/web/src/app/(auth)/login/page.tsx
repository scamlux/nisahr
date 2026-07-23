'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { GoogleButton } from '@/components/auth/google-button';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { toast } from '@/components/ui/toast';
import { useI18n } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      toast.success(
        `${t.pages.auth.welcomeBackToastPrefix} ${data.user.name.split(' ')[0]}${t.pages.auth.welcomeBackToastSuffix}`,
      );
      const me = await api.get('/auth/me');
      router.push(me.data.onboardingCompleted ? '/home' : '/onboarding');
    } catch (err) {
      toast.error(apiError(err, t.pages.auth.loginFailedError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={t.pages.auth.welcomeBackTitle}
      subtitle={t.pages.auth.loginSubtitle}
      footer={
        <>
          {t.pages.auth.newHereText}{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            {t.pages.auth.createAccountButton}
          </Link>
        </>
      }
    >
      <GoogleButton />
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t.pages.auth.emailLabel}</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t.pages.auth.passwordLabel}</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.pages.auth.signInButton}
        </button>
        <p className="rounded-lg border border-border bg-surface-2/50 p-3 text-xs text-muted">
          {t.pages.auth.demoLoginsPrefix} <code className="text-fg">password123</code>
          {t.pages.auth.demoLoginsSuffix} premium@careeros.dev · student@careeros.dev · admin@careeros.dev
        </p>
      </form>
    </AuthShell>
  );
}

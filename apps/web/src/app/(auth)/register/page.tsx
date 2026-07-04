'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { toast } from '@/components/ui/toast';
import { useI18n } from '@/lib/i18n';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      toast.success(t.pages.auth.accountCreatedToast);
      router.push('/onboarding');
    } catch (err) {
      toast.error(apiError(err, t.pages.auth.registrationFailedError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={t.pages.auth.createAccountTitle}
      subtitle={t.pages.auth.registerSubtitle}
      footer={
        <>
          {t.pages.auth.alreadyHaveAccountText}{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t.pages.auth.signInButton}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t.pages.auth.fullNameLabel}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t.pages.auth.emailLabel}</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{t.pages.auth.passwordLabel}</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          <p className="mt-1 text-xs text-muted">{t.pages.auth.passwordHint}</p>
        </div>
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.pages.auth.createAccountButton}
        </button>
      </form>
    </AuthShell>
  );
}

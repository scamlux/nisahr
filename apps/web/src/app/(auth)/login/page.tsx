'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { toast } from '@/components/ui/toast';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const [email, setEmail] = useState('premium@careeros.dev');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      const me = await api.get('/auth/me');
      router.push(me.data.onboardingCompleted ? '/home' : '/onboarding');
    } catch (err) {
      toast.error(apiError(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your journey."
      footer={
        <>
          New here?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
        </button>
        <p className="rounded-lg border border-border bg-surface-2/50 p-3 text-xs text-muted">
          Demo logins (password <code className="text-fg">password123</code>): premium@careeros.dev · student@careeros.dev · admin@careeros.dev
        </p>
      </form>
    </AuthShell>
  );
}

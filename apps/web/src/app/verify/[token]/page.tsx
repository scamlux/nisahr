'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { BadgeCheck, Loader2, ShieldAlert } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { Certificate } from '@/components/assessment/certificate';

interface VerifyResp {
  valid: boolean;
  recipient?: string;
  role?: string;
  score?: number;
  serial?: string;
  issuedAt?: string;
}

/**
 * Public certificate verification (F6). No auth. A valid token renders the
 * certificate from PII-free data; an invalid/tampered token shows "not found".
 */
export default function VerifyPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useI18n();
  const tr = t.pages.verify;
  const [state, setState] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [data, setData] = useState<VerifyResp | null>(null);

  useEffect(() => {
    axios
      .get<VerifyResp>(`${API_URL}/verify/${encodeURIComponent(token)}`)
      .then((r) => {
        setData(r.data);
        setState(r.data.valid ? 'valid' : 'invalid');
      })
      .catch(() => setState('invalid'));
  }, [token]);

  const verifyUrl = useMemo(
    () => (typeof window !== 'undefined' ? window.location.href : ''),
    [],
  );

  const certLabels = {
    title: tr.certTitle, presentedTo: tr.certPresentedTo, completed: tr.certCompleted,
    score: tr.certScore, serial: tr.certSerial, issued: tr.certIssued,
    verifyHint: tr.certVerifyHint, download: tr.certDownload, verified: tr.certVerified,
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="mb-6 inline-block font-display text-lg font-bold">CareerOS</Link>

        {state === 'loading' && (
          <div className="grid min-h-[50vh] place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {state === 'valid' && data && (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">
              <BadgeCheck className="h-5 w-5" /> {tr.validBanner}
            </div>
            <Certificate
              cert={{
                recipient: data.recipient!,
                role: data.role!,
                score: data.score!,
                serial: data.serial!,
                issuedAt: data.issuedAt!,
              }}
              verifyUrl={verifyUrl}
              labels={certLabels}
            />
          </div>
        )}

        {state === 'invalid' && (
          <div className="card mt-10 p-10 text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-danger/10 text-danger">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold">{tr.invalidTitle}</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{tr.invalidSubtitle}</p>
            <Link href="/" className="btn-ghost mt-6 inline-flex">{tr.backHome}</Link>
          </div>
        )}
      </div>
    </div>
  );
}

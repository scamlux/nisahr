'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Award, BadgeCheck, Download, ShieldCheck } from 'lucide-react';

export interface CertificateData {
  recipient: string;
  role: string;
  score: number;
  serial: string;
  issuedAt: string;
  verifyToken?: string;
}

/**
 * Verifiable completion certificate (F6). The QR encodes the public verify URL.
 * "Download PDF" uses the browser's print-to-PDF (vector, zero server deps) —
 * a print stylesheet isolates the certificate from the rest of the page.
 */
export function Certificate({
  cert,
  verifyUrl,
  labels,
}: {
  cert: CertificateData;
  verifyUrl: string;
  labels: {
    title: string;
    presentedTo: string;
    completed: string;
    score: string;
    serial: string;
    issued: string;
    verifyHint: string;
    download: string;
    verified: string;
  };
}) {
  const [qr, setQr] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, { width: 240, margin: 1, errorCorrectionLevel: 'M' })
      .then(setQr)
      .catch(() => setQr(''));
  }, [verifyUrl]);

  const date = new Date(cert.issuedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      {/* Print isolation: only the certificate prints. */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #certificate-print, #certificate-print * { visibility: visible !important; }
          #certificate-print {
            position: fixed; inset: 0; margin: auto;
            width: 100%; box-shadow: none !important; border-radius: 0 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div
        id="certificate-print"
        className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[#d4b26a]/50 p-8 text-[#2a2620] shadow-soft sm:p-12"
        style={{ background: 'linear-gradient(135deg,#fdfaf3,#f3ead6)' }}
      >
        {/* ornamental border */}
        <div className="pointer-events-none absolute inset-3 rounded-2xl border border-[#d4b26a]/40" />
        <div className="relative flex flex-col items-center text-center">
          <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#d4b26a]/20 text-[#a9822f]">
            <Award className="h-7 w-7" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a9822f]">CareerOS</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{labels.title}</h1>
          <p className="mt-6 text-sm text-[#6b6558]">{labels.presentedTo}</p>
          <p className="mt-1 font-display text-2xl font-semibold">{cert.recipient}</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[#4a453b]">
            {labels.completed} <span className="font-semibold">{cert.role}</span> — {labels.score}{' '}
            <span className="font-semibold">{Math.round(cert.score)}%</span>.
          </p>

          <div className="mt-8 flex w-full items-end justify-between gap-6">
            <div className="text-left text-[11px] text-[#6b6558]">
              <p>{labels.serial}: <span className="font-mono break-all">{cert.serial}</span></p>
              <p className="mt-1">{labels.issued}: {date}</p>
              <p className="mt-2 flex items-center gap-1 text-[#a9822f]">
                <ShieldCheck className="h-3.5 w-3.5" /> {labels.verifyHint}
              </p>
            </div>
            {qr && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="Verification QR" className="h-24 w-24 rounded-lg bg-white p-1" />
            )}
          </div>
        </div>
      </div>

      <div className="no-print mt-5 flex items-center justify-center gap-3">
        <button onClick={() => window.print()} className="btn-primary">
          <Download className="h-4 w-4" /> {labels.download}
        </button>
        <span className="flex items-center gap-1 text-xs text-success">
          <BadgeCheck className="h-4 w-4" /> {labels.verified}
        </span>
      </div>
    </div>
  );
}

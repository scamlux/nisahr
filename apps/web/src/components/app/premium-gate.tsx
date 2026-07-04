'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crown, Lock } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function PremiumGate({ feature }: { feature: string }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card relative overflow-hidden p-10 text-center"
    >
      <div className="aurora-blob left-1/2 top-0 h-56 w-56 -translate-x-1/2 bg-primary/30" />
      <div className="relative mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-warning/30 to-primary/30 text-warning">
        <Lock className="h-7 w-7" />
      </div>
      <h3 className="relative font-display text-xl font-bold">
        {t.pages.app.premiumGateTitle.replace('{feature}', feature)}
      </h3>
      <p className="relative mx-auto mt-2 max-w-md text-sm text-muted">
        {t.pages.app.premiumGateBody.replace('{feature}', feature.toLowerCase())}
      </p>
      <button onClick={() => router.push('/profile')} className="btn-primary relative mx-auto mt-6">
        <Crown className="h-4 w-4" /> {t.pages.app.premiumGateCta}
      </button>
    </motion.div>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Проверка сертификата',
  robots: { index: false, follow: false },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

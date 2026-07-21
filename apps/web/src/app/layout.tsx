import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { themeInitScript } from '@/lib/theme';
import { siteName, siteUrl, defaultDescription } from '@/lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

const defaultTitle = 'CareerOS — Your AI Career Operating System';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: defaultTitle,
    template: '%s · CareerOS',
  },
  description: defaultDescription,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName,
    url: siteUrl,
    title: defaultTitle,
    description: defaultDescription,
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: { index: true, follow: true },
  verification: { google: 'TOtDtnceVs9-irYbtqHA0-ru15mNT9FTpXb9zbYQDQY' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`dark ${inter.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the persisted theme before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="grain min-h-screen bg-bg text-fg antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

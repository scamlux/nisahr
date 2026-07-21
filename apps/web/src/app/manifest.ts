import type { MetadataRoute } from 'next';
import { siteName, defaultDescription } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: siteName,
    description: defaultDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#1e1e1c',
    theme_color: '#d97757',
    icons: [
      {
        src: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        purpose: 'any',
      },
    ],
  };
}

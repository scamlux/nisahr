import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${siteUrl}/`, lastModified, priority: 1.0 },
    { url: `${siteUrl}/login`, lastModified, priority: 0.6 },
    { url: `${siteUrl}/register`, lastModified, priority: 0.6 },
    { url: `${siteUrl}/onboarding`, lastModified, priority: 0.6 },
  ];
}

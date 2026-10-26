import type { MetadataRoute } from 'next'
import { looks } from '@/data/looks'
import { siteUrl } from '@/lib/site'
export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/looks', ...looks.map((look) => `/looks/${look.slug}`)].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: 'monthly',
    priority: path ? 0.7 : 1,
  }))
}

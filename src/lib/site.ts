import type { Metadata } from 'next'
const configured =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://next-film-darkroom.vercel.app')
export const siteUrl = new URL(configured).origin
export function pageMetadata(title: string, description: string, path = '/'): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} / Softlight Lab`,
      description,
      url: path,
      siteName: 'Softlight Lab',
      type: 'website',
      images: [
        {
          url: '/og.png',
          width: 1200,
          height: 630,
          alt: 'Softlight Lab. Keep the light. Change the mood.',
        },
      ],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
  }
}

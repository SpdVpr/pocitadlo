import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EvidujCas.cz - Sledování odpracovaných hodin',
    short_name: 'EvidujCas.cz',
    description: 'Moderní aplikace pro evidenci pracovní doby s end-to-end šifrováním',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#9333ea',
    icons: [
      {
        src: '/front-image.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
    lang: 'cs',
    dir: 'ltr',
    orientation: 'portrait-primary',
    categories: ['productivity', 'business'],
  }
}


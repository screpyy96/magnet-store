// SEO Optimized Metadata for UK Market
export const metadata = {
  metadataBase: new URL('https://mysweetmagnets.co.uk'),
  title: {
    default: 'Custom Fridge Magnets UK | Personalised Photo Magnets | My Sweet Magnets',
    template: '%s | My Sweet Magnets UK'
  },
  description: 'Create beautiful custom fridge magnets with your photos in the UK. High-quality, durable photo magnets with fast UK delivery. Personalised gifts for any occasion. 100% Satisfaction Guaranteed!',
  keywords: [
    'custom magnets UK', 'personalised fridge magnets', 'photo magnets UK', 'custom photo magnets',
    'personalised gifts UK', 'fridge magnets', 'bespoke magnets', 'custom name magnets',
    'UK magnet shop', 'photo gifts', 'customised magnets', 'magnetic photo prints',
    'create your own magnets', 'photo fridge magnets', 'personalised magnet set',
    'custom magnets with photos', 'UK made magnets', 'high quality photo magnets',
    'bespoke fridge magnets', 'custom photo gifts UK', 'personalised home decor',
    'photo keepsake magnets', 'custom photo magnets UK'
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Custom Fridge Magnets UK | Personalised Photo Magnets | My Sweet Magnets',
    description: 'Create stunning custom fridge magnets with your photos. Fast UK delivery, premium quality materials, and 100% satisfaction guaranteed. Design your personalised magnets today!',
    url: 'https://mysweetmagnets.co.uk',
    siteName: 'My Sweet Magnets UK',
    images: [
      {
        url: '/images/og-custom-magnets-uk.jpg',
        width: 1200,
        height: 630,
        alt: 'Premium Custom Fridge Magnets Made in UK - Personalised with Your Photos'
      }
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom Fridge Magnets UK | Personalised Photo Magnets',
    description: '✨ Create beautiful custom fridge magnets with your photos. Fast UK delivery, premium quality materials, and 100% satisfaction guaranteed. Design yours today! #CustomMagnets #PhotoGifts #UKMade',
    images: [{
      url: '/images/twitter-custom-magnets.jpg',
      alt: 'Premium Custom Fridge Magnets Made in UK - Personalised with Your Photos',
      width: 1200,
      height: 628
    }],
    site: '@MySweetMagnetsUK',
    creator: '@MySweetMagnetsUK',
    creatorId: '1467726470533750000'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
      noimageindex: false,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE',
    yandex: 'YANDEX_VERIFICATION_CODE',
    bing: 'BING_VERIFICATION_CODE'
  },
  applicationName: 'My Sweet Magnets UK',
  authors: [{ name: 'My Sweet Magnets Team' }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icons/icon-192x192.png'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'My Sweet Magnets'
  }
}
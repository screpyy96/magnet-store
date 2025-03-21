// Acest fișier va conține doar exportul de metadata
export const metadata = {
  title: {
    default: 'My Sweet Magnets - Custom Fridge Magnets UK',
    template: '%s | My Sweet Magnets'
  },
  description: 'Create beautiful custom magnets for your fridge. Upload photos, create designs, and order high-quality magnets delivered to your door in the UK.',
  keywords: ['custom magnets', 'fridge magnets', 'photo magnets', 'personalized magnets', 'custom gifts', 'UK magnets'],
  openGraph: {
    title: 'My Sweet Magnets - Custom Fridge Magnets UK',
    description: 'Create beautiful custom magnets for your fridge. Upload photos, create designs, and order high-quality magnets delivered across the UK.',
    url: 'https://mysweetmagnets.co.uk',
    siteName: 'My Sweet Magnets',
    images: [
      {
        url: 'https://mysweetmagnets.co.uk/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'My Sweet Magnets - Custom Fridge Magnets'
      }
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Sweet Magnets - Custom Fridge Magnets UK',
    description: 'Create beautiful custom magnets for your fridge. Upload photos, create designs, and order high-quality magnets delivered across the UK.',
    images: [{
      url: 'https://mysweetmagnets.co.uk/twitter-image.jpg',
      alt: 'My Sweet Magnets - Custom Fridge Magnets'
    }],
    site: '@mysweetmagnets',
    creator: '@mysweetmagnets'
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
    },
  },
  canonical: 'https://mysweetmagnets.co.uk',
  alternates: {
    canonical: 'https://mysweetmagnets.co.uk',
  },
  metadataBase: new URL('https://mysweetmagnets.co.uk'),
} 
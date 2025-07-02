import { metadata as mainMetadata } from '../metadata';

export const metadata = {
  ...mainMetadata,
  title: 'About Us | My Sweet Magnets - Handcrafted in the UK',
  description: 'Discover our story at My Sweet Magnets UK. Learn about our passion for creating beautiful, high-quality custom photo magnets. Handcrafted with love in Manchester.',
  keywords: [
    ...mainMetadata.keywords,
    'about my sweet magnets', 'our story', 'UK magnet makers', 'handcrafted magnets UK',
    'Manchester magnet makers', 'custom photo magnets story', 'about our company',
    'meet the team', 'family business UK', 'magnet makers Manchester'
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    ...mainMetadata.openGraph,
    title: 'About Us | My Sweet Magnets - Handcrafted in the UK',
    description: 'Discover our story at My Sweet Magnets UK. Learn about our passion for creating beautiful, high-quality custom photo magnets. Handcrafted with love in Manchester.',
    url: 'https://mysweetmagnets.co.uk/about',
    images: [
      {
        url: '/images/og-about-us.jpg',
        width: 1200,
        height: 630,
        alt: 'About My Sweet Magnets - Handcrafted Custom Photo Magnets in the UK'
      }
    ]
  },
  twitter: {
    ...mainMetadata.twitter,
    title: 'About Us | My Sweet Magnets - Handcrafted in the UK',
    description: '✨ Discover our story of creating beautiful custom photo magnets. Handcrafted with love in Manchester. #MySweetMagnets #UKMade #PhotoMagnets',
    images: [{
      url: '/images/twitter-about-us.jpg',
      alt: 'About My Sweet Magnets - Handcrafted Custom Photo Magnets',
      width: 1200,
      height: 628
    }]
  }
}

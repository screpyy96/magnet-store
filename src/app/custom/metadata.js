import { metadata as mainMetadata } from '../metadata';

export const metadata = {
  ...mainMetadata,
  title: 'Create Custom Photo Magnets | Design Yours Online | My Sweet Magnets UK',
  description: 'Design your own personalised fridge magnets with our easy-to-use online tool. Upload photos, choose from various sizes & shapes, and create beautiful memories that stick. High-quality custom magnets starting at £9.99 with fast UK delivery.',
  keywords: [
    ...mainMetadata.keywords,
    'create custom magnets', 'design your own magnets', 'personalised magnets UK',
    'custom photo magnets online', 'make your own magnets', 'photo magnet maker',
    'custom fridge magnets design', 'personalised photo magnets UK', 'magnet creator',
    'custom magnet designer', 'photo magnet creator UK', 'bespoke magnets online'
  ],
  alternates: {
    canonical: '/custom',
  },
  openGraph: {
    ...mainMetadata.openGraph,
    title: 'Create Custom Photo Magnets | Design Yours Online | My Sweet Magnets UK',
    description: 'Design your own personalised fridge magnets with our easy-to-use online tool. Upload photos, choose from various sizes & shapes, and create beautiful memories that stick. High-quality custom magnets starting at £9.99 with fast UK delivery.',
    url: 'https://mysweetmagnets.co.uk/custom',
    images: [
      {
        url: '/images/og-custom-magnets.jpg',
        width: 1200,
        height: 630,
        alt: 'Create Custom Photo Magnets Online - My Sweet Magnets UK'
      }
    ]
  },
  twitter: {
    ...mainMetadata.twitter,
    title: 'Create Custom Photo Magnets | Design Yours Online',
    description: '✨ Design your own personalised fridge magnets with our easy online tool. Upload photos, customize & order today! #CustomMagnets #PhotoGifts #UKMade',
    images: [{
      url: '/images/twitter-custom-magnets.jpg',
      alt: 'Create Custom Photo Magnets - My Sweet Magnets UK',
      width: 1200,
      height: 628
    }]
  }
}
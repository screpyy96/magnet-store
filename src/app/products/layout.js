// Metadata for products page
export const metadata = {
  title: 'Premium Photo Magnets - Custom Magnet Collection | My Sweet Magnets UK',
  description: 'Browse our collection of premium custom photo magnets. Single magnets, value packs, business promotional magnets, and wedding favors. Fast UK delivery and professional quality.',
  openGraph: {
    title: 'Premium Photo Magnets Collection - My Sweet Magnets UK',
    description: 'Transform your favorite memories into beautiful, durable magnets. Professional quality printing with fast UK delivery. Single magnets from £5, value packs available.',
    images: [{
      url: '/images/magnet2.jpeg',
      width: 1200,
      height: 630,
      alt: 'Premium Custom Photo Magnets Collection - My Sweet Magnets UK'
    }]
  }
};

export default function ProductsLayout({ children }) {
  return children;
}

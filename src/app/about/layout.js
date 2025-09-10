// Metadata for about page
export const metadata = {
  title: 'About Us - The Story Behind My Sweet Magnets UK',
  description: 'Learn about My Sweet Magnets - a family-run UK business creating premium custom photo magnets since 2018. Handcrafted in Manchester with love, creativity, and a dash of magic.',
  openGraph: {
    title: 'About My Sweet Magnets - UK Custom Photo Magnet Specialists',
    description: 'Discover the story behind My Sweet Magnets, founded by sisters Emma and Sophie in Manchester. Premium quality custom magnets made with love since 2018.',
    images: [{
      url: '/images/magnet3.jpeg',
      width: 1200,
      height: 630,
      alt: 'My Sweet Magnets Workshop - Handcrafted in Manchester UK'
    }]
  }
};

export default function AboutLayout({ children }) {
  return children;
}

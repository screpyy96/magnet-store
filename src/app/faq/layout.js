// Metadata for FAQ page
export const metadata = {
  title: 'FAQ - Frequently Asked Questions | My Sweet Magnets UK',
  description: 'Find answers to common questions about our custom photo magnets, shipping, ordering process, and more. Get help with your My Sweet Magnets order.',
  openGraph: {
    title: 'FAQ - My Sweet Magnets UK',
    description: 'Get answers to frequently asked questions about custom photo magnets, shipping, and our services.',
    images: [{
      url: '/images/magnet1.jpeg',
      width: 1200,
      height: 630,
      alt: 'FAQ - My Sweet Magnets UK'
    }]
  }
};

export default function FAQLayout({ children }) {
  return children;
}

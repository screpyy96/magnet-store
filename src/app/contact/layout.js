// Metadata for contact page
export const metadata = {
  title: 'Contact Us - Get in Touch | My Sweet Magnets UK',
  description: 'Contact My Sweet Magnets for custom photo magnet orders, bulk quotes, or customer support. Fast response times and friendly UK-based customer service team.',
  openGraph: {
    title: 'Contact My Sweet Magnets - UK Custom Photo Magnet Specialists',
    description: 'Get in touch with our friendly team for custom magnet orders, bulk quotes, or any questions. Based in Manchester, UK with fast response times.',
    images: [{
      url: '/images/magnet1.jpeg',
      width: 1200,
      height: 630,
      alt: 'Contact My Sweet Magnets - Custom Photo Magnets UK'
    }]
  }
};

export default function ContactLayout({ children }) {
  return children;
}

import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

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
  verification: {
    google: 'your-google-verification-code',
  },
  metadataBase: new URL('https://mysweetmagnets.co.uk'),
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-16 pb-20 sm:pb-8 bg-cream">{children}</main> 
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}

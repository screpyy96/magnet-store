import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'MagnetCraft - Custom Fridge Magnets',
    template: '%s | MagnetCraft'
  },
  description: 'Create beautiful custom magnets for your fridge. Upload photos, create designs, and order high-quality magnets delivered to your door.',
  keywords: ['custom magnets', 'fridge magnets', 'photo magnets', 'personalized magnets', 'custom gifts'],
  openGraph: {
    title: 'MagnetCraft - Custom Fridge Magnets',
    description: 'Create beautiful custom magnets for your fridge. Upload photos, create designs, and order high-quality magnets.',
    url: 'https://magnetcraft.com',
    siteName: 'MagnetCraft',
    images: [
      {
        url: 'https://magnetcraft.com/og-image.jpg',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MagnetCraft - Custom Fridge Magnets',
    description: 'Create beautiful custom magnets for your fridge. Upload photos, create designs, and order high-quality magnets.',
    images: ['https://magnetcraft.com/twitter-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}

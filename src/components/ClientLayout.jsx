'use client';

import Providers from './Providers'
import Navbar from './Navbar'
import Footer from './Footer'
import ErrorBoundary from './ui/ErrorBoundary'
import NewsletterPopup from './NewsletterPopup'

export default function ClientLayout({ children }) {
  return (
    <ErrorBoundary>
      <Providers>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow pt-16 md:pt-20 pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
        </div>
        <NewsletterPopup />
      </Providers>
    </ErrorBoundary>
  )
} 
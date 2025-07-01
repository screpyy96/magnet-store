'use client';

import Providers from './Providers'
import Navbar from './Navbar'
import Footer from './Footer'
import ErrorBoundary from './ui/ErrorBoundary'

export default function ClientLayout({ children }) {
  return (
    <ErrorBoundary>
      <Providers>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </Providers>
    </ErrorBoundary>
  )
} 
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Providers from './Providers';
import Navbar from './Navbar';
import Footer from './Footer';
import ErrorBoundary from './ui/ErrorBoundary';
import NewsletterPopup from './NewsletterPopup';
import { OrganizationSchema } from './SEO/OrganizationSchema';

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // Track page views
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_title: document?.title || '',
        page_location: window.location.href
      });
    }
  }, [pathname]);

  return (
    <ErrorBoundary>
      <Providers>
        {/* Add Organization Schema */}
        <OrganizationSchema />
        
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
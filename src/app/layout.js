import React from 'react';
import { Inter } from 'next/font/google'
import './globals.css'
import { metadata } from './metadata'  // Import metadata from separate file
import ClientLayout from '@/components/ClientLayout'  // We'll create this component below
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

// Export metadata for Next.js to use
export { metadata }

// Export viewport settings (e.g., themeColor) via the App Router API
export const viewport = {
  themeColor: '#ec4899',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager - load as early as possible in <head> */}
        {GTM_ID && (
          <Script id="gtm-base" strategy="afterInteractive">{`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}</Script>
        )}
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}

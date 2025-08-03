import React from 'react';
import { Inter } from 'next/font/google'
import './globals.css'
import { metadata } from './metadata'  // Import metadata from separate file
import ClientLayout from '@/components/ClientLayout'  // We'll create this component below
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

// Export metadata for Next.js to use
export { metadata }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ec4899" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="My Sweet Magnets" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}

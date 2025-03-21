import { Inter } from 'next/font/google'
import './globals.css'
import { metadata } from './metadata'  // Import metadata from separate file
import ClientLayout from '@/components/ClientLayout'  // We'll create this component below

const inter = Inter({ subsets: ['latin'] })

// Export metadata for Next.js to use
export { metadata }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}

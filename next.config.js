/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    domains: [
      process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', '') : '',
      'images.unsplash.com'
    ].filter(Boolean),
  },
  experimental: {
    // Remove turbo flag as it's causing warnings
  }
}

module.exports = nextConfig 
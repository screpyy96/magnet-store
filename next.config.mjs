/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'igykxsgetwrlmwsyzids.supabase.co' // Supabase storage domain
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  serverExternalPackages: ['@supabase/supabase-js']
};

export default nextConfig;

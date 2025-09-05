/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Disable optimization to avoid sharp dependency during build
    unoptimized: true,
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'supabase.co' },
    ],
  },
  // Leaflet requires this to avoid SSR issues
  transpilePackages: ['leaflet', 'react-leaflet'],
}

module.exports = nextConfig

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ignore missing env vars during build
  env: {
    SKIP_ENV_VALIDATION: 'true',
  },
}

export default nextConfig

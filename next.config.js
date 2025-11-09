/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'
const nextConfig = {
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'onlyfanshop.app', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/onlyfan-f9406.appspot.com/o/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  env: {
    // In development, use same-origin URLs and let rewrites proxy to backend to avoid CORS
    NEXT_PUBLIC_API_URL: isDev ? '' : (process.env.NEXT_PUBLIC_API_URL || ''),
  },
  async rewrites() {
    // Proxy API calls to backend at localhost:8080 in development to bypass CORS
    if (isDev) {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/api/:path*',
        },
        {
          source: '/login/:path*',
          destination: 'http://localhost:8080/login/:path*',
        },
        {
          source: '/store-locations',
          destination: 'http://localhost:8080/store-locations',
        },
        {
          source: '/store-locations/:path*',
          destination: 'http://localhost:8080/store-locations/:path*',
        },
      ]
    }
    return []
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    
    return config
  },
}

module.exports = nextConfig








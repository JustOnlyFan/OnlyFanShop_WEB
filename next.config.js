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
          source: '/users/:path*',
          destination: 'http://localhost:8080/users/:path*',
        },
        {
          source: '/order/:path*',
          destination: 'http://localhost:8080/order/:path*',
        },
        {
          source: '/product/:path*',
          destination: 'http://localhost:8080/product/:path*',
        },
        {
          source: '/category/:path*',
          destination: 'http://localhost:8080/category/:path*',
        },
        {
          source: '/brands/:path*',
          destination: 'http://localhost:8080/brands/:path*',
        },
        {
          source: '/colors/:path*',
          destination: 'http://localhost:8080/colors/:path*',
        },
        {
          source: '/warranties/:path*',
          destination: 'http://localhost:8080/warranties/:path*',
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








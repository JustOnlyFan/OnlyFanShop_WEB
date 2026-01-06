/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Tắt source maps trong production để giảm bundle size
  productionBrowserSourceMaps: false,
  // Tối ưu compiler
  swcMinify: true,
  images: {
    domains: ['res.cloudinary.com', 'onlyfanshop.app', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
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
  // Removed NEXT_PUBLIC_API_URL - frontend uses relative URLs
  // In development: Next.js rewrites proxy to backend
  // In production: Use same domain or reverse proxy
  async rewrites() {
    // Proxy API calls to backend at localhost:8080 in development to bypass CORS
    if (isDev) {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/api/:path*',
        },
        {
          source: '/login',
          destination: 'http://localhost:8080/login',
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
        {
          source: '/store-inventory/:path*',
          destination: 'http://localhost:8080/store-inventory/:path*',
        },
        {
          source: '/tags/:path*',
          destination: 'http://localhost:8080/tags/:path*',
        },
        {
          source: '/cart/:path*',
          destination: 'http://localhost:8080/cart/:path*',
        },
        {
          source: '/cartItem/:path*',
          destination: 'http://localhost:8080/cartItem/:path*',
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
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          // Tách framer-motion
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            priority: 30,
            reuseExistingChunk: true,
          },
          // Tách react-query
          reactQuery: {
            test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
            name: 'react-query',
            priority: 25,
            reuseExistingChunk: true,
          },
          // Tách three.js và related
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'three',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Tách lucide-react icons
          lucide: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide',
            priority: 15,
            reuseExistingChunk: true,
          },
          // Vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
            minChunks: 2,
          },
          // Common chunks
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            enforce: true,
          },
        },
      }
      
      // Tree shaking optimization
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }
    
    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)







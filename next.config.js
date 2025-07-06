const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    webpackBuildWorker: true,
    // Enable optimized prefetching
    optimisticClientCache: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  // Webpack optimizations to reduce console warnings and improve performance
  webpack: (config, { dev, isServer }) => {
    // Reduce webpack warnings in development
    if (dev) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    
    // Optimize bundle splitting for better caching
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          // Separate chunk for Framer Motion
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 15,
          },
        },
      },
    };
    
    return config;
  },
  // Note: headers() doesn't work with output: 'export'
  // Security headers should be configured at the hosting level
  // Environment variable validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
}

module.exports = withPWA(nextConfig)

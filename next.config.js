/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable gzip compression
  compress: true,

  // Optimize package imports to reduce bundle size (tree-shaking)
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },

  async rewrites() {
    return [
      {
        source: '/compress_pdf',
        destination: '/tools/pdf-compressor',
      },
      {
        source: '/compress-pdf',
        destination: '/tools/pdf-compressor',
      },
      {
        source: '/pdf-compressor',
        destination: '/tools/pdf-compressor',
      },
    ];
  },
};

module.exports = nextConfig;

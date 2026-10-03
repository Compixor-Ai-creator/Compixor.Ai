/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable gzip compression
  compress: true,
  poweredByHeader: false,
  swcMinify: true,

  // Production compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  // Images remote patterns for testimonials
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Optimize package imports to reduce bundle size (tree-shaking)
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'sonner'],
  },

  webpack: (config, { isServer }) => {
    const path = require('path');
    config.resolve.alias.canvas = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    if (isServer) {
      config.resolve.alias['onnxruntime-web'] = false;
      config.resolve.alias['@imgly/background-removal'] = false;
    } else {
      config.resolve.alias['onnxruntime-web$'] = path.resolve(
        __dirname,
        'node_modules/onnxruntime-web/dist/ort.min.js'
      );
      config.resolve.alias['onnxruntime-web/webgpu$'] = path.resolve(
        __dirname,
        'node_modules/onnxruntime-web/dist/ort.webgpu.min.js'
      );
      config.resolve.alias['onnxruntime-web/wasm$'] = path.resolve(
        __dirname,
        'node_modules/onnxruntime-web/dist/ort.wasm.min.js'
      );
      config.resolve.alias['onnxruntime-web/all$'] = path.resolve(
        __dirname,
        'node_modules/onnxruntime-web/dist/ort.all.min.js'
      );
    }

    return config;
  },

  async redirects() {
    return [
      {
        source: '/compress_pdf',
        destination: '/tools/pdf-compressor',
        permanent: true,
      },
      {
        source: '/compress-pdf',
        destination: '/tools/pdf-compressor',
        permanent: true,
      },
      {
        source: '/pdf-compressor',
        destination: '/tools/pdf-compressor',
        permanent: true,
      },
      {
        source: '/tools/pdf-merge',
        destination: '/tools/pdf-organizer',
        permanent: true,
      },
      {
        source: '/tools/pdf-split',
        destination: '/tools/pdf-organizer',
        permanent: true,
      },
      {
        source: '/pdf-organizer',
        destination: '/tools/pdf-organizer',
        permanent: true,
      },
      {
        source: '/merge-pdf',
        destination: '/tools/pdf-organizer',
        permanent: true,
      },
      {
        source: '/split-pdf',
        destination: '/tools/pdf-organizer',
        permanent: true,
      },
      {
        source: '/tools/pdf-protect',
        destination: '/tools/protect-pdf',
        permanent: true,
      },
      {
        source: '/tools/pdf-watermark',
        destination: '/tools/add-watermark',
        permanent: true,
      },
      {
        source: '/tools/add-pdf-watermark',
        destination: '/tools/add-watermark',
        permanent: true,
      },
      {
        source: '/tools/remove-pdf-watermark',
        destination: '/tools/remove-watermark',
        permanent: true,
      },
      {
        source: '/tools/pdf-merge-split',
        destination: '/tools/pdf-organizer',
        permanent: true,
      },
      {
        source: '/tools/passport-photo-maker',
        destination: '/tools/passport-photo',
        permanent: true,
      },
      {
        source: '/tools/image-to-word',
        destination: '/tools/img-to-word',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable gzip compression
  compress: true,

  // Production compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  // Optimize package imports to reduce bundle size (tree-shaking)
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
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
      {
        source: '/tools/pdf-merge',
        destination: '/tools/pdf-organizer?tab=merge',
      },
      {
        source: '/tools/pdf-split',
        destination: '/tools/pdf-organizer?tab=split',
      },
      {
        source: '/pdf-organizer',
        destination: '/tools/pdf-organizer',
      },
      {
        source: '/merge-pdf',
        destination: '/tools/pdf-organizer?tab=merge',
      },
      {
        source: '/split-pdf',
        destination: '/tools/pdf-organizer?tab=split',
      },
    ];
  },
};

module.exports = nextConfig;

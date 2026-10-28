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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 31536000,
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
      // 301 Permanent Blog Slugs Redirects (Screaming Frog crawl fix)
      {
        source: '/blog/how-to-compress-word-documents',
        destination: '/blog/how-to-compress-word-docx-files',
        permanent: true,
      },
      {
        source: '/blog/how-to-remove-watermark-from-pdf',
        destination: '/blog/remove-watermark-from-pdf-cleanly',
        permanent: true,
      },
      {
        source: '/blog/unlock-password-protected-pdf-online',
        destination: '/blog/how-to-remove-password-from-pdf',
        permanent: true,
      },
      // 301 Permanent Domain Redirects: old Vercel domain -> new official domain
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'compixor-ai.vercel.app',
          },
        ],
        destination: 'https://compixor-ai.cloud/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.compixor-ai.vercel.app',
          },
        ],
        destination: 'https://compixor-ai.cloud/:path*',
        permanent: true,
      },
      // 301 Permanent Canonical Domain Redirect: www to apex domain
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.compixor-ai.cloud',
          },
        ],
        destination: 'https://compixor-ai.cloud/:path*',
        permanent: true,
      },
      {
        source: '/blog/how-to-make-passport-photo-online',
        destination: '/blog/passport-size-photo-maker-online-free',
        permanent: true,
      },
      {
        source: '/blog/passport-photo-size-pakistan',
        destination: '/blog/passport-size-photo-maker-online-free',
        permanent: true,
      },
      {
        source: '/blog/change-photo-background-to-white-online',
        destination: '/blog/passport-size-photo-maker-online-free',
        permanent: true,
      },
      {
        source: '/blog/passport-size-photo-kaise-banayen',
        destination: '/blog/passport-size-photo-maker-online-free',
        permanent: true,
      },
      {
        source: '/blog/how-to-print-passport-photos-at-home',
        destination: '/blog/passport-size-photo-maker-online-free',
        permanent: true,
      },
      {
        source: '/blog/passport-photo-background-colour-by-country',
        destination: '/blog/passport-size-photo-maker-online-free',
        permanent: true,
      },
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
      // Tools root and alias shortcuts to prevent 404s
      {
        source: '/tools',
        destination: '/#tools',
        permanent: true,
      },
      {
        source: '/tools/qr',
        destination: '/tools/qr-generator',
        permanent: true,
      },
      {
        source: '/tools/full-dp',
        destination: '/tools/full-dp-maker',
        permanent: true,
      },
      {
        source: '/tools/pdf-to-docx',
        destination: '/tools/pdf-to-word',
        permanent: true,
      },
      {
        source: '/tools/img-to-docx',
        destination: '/tools/img-to-word',
        permanent: true,
      },
      {
        source: '/tools/word',
        destination: '/tools/word-compressor',
        permanent: true,
      },
      {
        source: '/word-compressor',
        destination: '/tools/word-compressor',
        permanent: true,
      },
      {
        source: '/passport-photo',
        destination: '/tools/passport-photo',
        permanent: true,
      },
      {
        source: '/qr-generator',
        destination: '/tools/qr-generator',
        permanent: true,
      },
      {
        source: '/full-dp-maker',
        destination: '/tools/full-dp-maker',
        permanent: true,
      },
      {
        source: '/protect-pdf',
        destination: '/tools/protect-pdf',
        permanent: true,
      },
      {
        source: '/unlock-pdf',
        destination: '/tools/unlock-pdf',
        permanent: true,
      },
      {
        source: '/add-watermark',
        destination: '/tools/add-watermark',
        permanent: true,
      },
      {
        source: '/remove-watermark',
        destination: '/tools/remove-watermark',
        permanent: true,
      },
      {
        source: '/pdf-to-word',
        destination: '/tools/pdf-to-word',
        permanent: true,
      },
      {
        source: '/img-to-word',
        destination: '/tools/img-to-word',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' blob: data: https: wss:; worker-src 'self' blob:; frame-ancestors 'self';",
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, must-revalidate',
          },
        ],
      },
      {
        source: '/blog/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/pdf.worker.min.mjs',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/apple-icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

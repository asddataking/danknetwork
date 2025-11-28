/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  // Optimize bundle size
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'i.ytimg.com',
      '*.ytimg.com',
      'fourthwall.com',
      '*.fourthwall.com',
      'fourthwallcdn.com',
      '*.fourthwallcdn.com',
      'images.unsplash.com',
      '*.unsplash.com',
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        // Apply CSP headers to all routes except API routes (which are server-side)
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: https://*.fourthwall.com https://*.fourthwallcdn.com",
              "font-src 'self' data: https://fonts.gstatic.com https://api.mapbox.com",
              "connect-src 'self' https://api.mapbox.com https://*.mapbox.com https://*.mapbox.cn https://events.mapbox.com https://*.supabase.co https://www.googleapis.com https://www.youtube.com https://*.fourthwall.com https://*.fourthwallcdn.com https://images.unsplash.com https://*.unsplash.com https://i.ytimg.com https://*.ytimg.com",
              "frame-src 'self' https://www.youtube.com https://www.google.com https://*.fourthwall.com",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);


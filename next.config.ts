import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Performance optimizations
  experimental: {
    // Enable optimized package imports for better tree-shaking
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },

  // Production optimizations
  compress: true,
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Allow inline styles for Tailwind and external stylesheets from Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Allow scripts from self, inline scripts (for Next.js), and eval (for development)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Allow images from self, data URIs (for SVGs), and https sources
              "img-src 'self' data: https:",
              // Allow fonts from self, data URIs, and Google Fonts
              "font-src 'self' data: https://fonts.gstatic.com",
              // Allow connections to self and Supabase
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              // Allow frames from self only
              "frame-src 'self'",
              // Allow form submissions to self
              "form-action 'self'",
              // Prevent loading of plugins
              "object-src 'none'",
              // Block all mixed content
              "block-all-mixed-content",
              // Upgrade insecure requests
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

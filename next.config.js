/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow production builds to succeed even if ESLint errors exist.
  // We still run ESLint locally and in CI, but hosting platforms shouldn't fail the build.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Some type errors can originate from mismatched types in devDependencies
  // (for example, Vitest/Vite types). In CI/hosting builds we prefer to
  // proceed with a deploy and surface type errors in PRs or CI jobs.
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://vcyheqaywyuzyczjrcfo.supabase.co wss://vcyheqaywyuzyczjrcfo.supabase.co",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
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
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

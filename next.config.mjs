/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig = {
  // Next.js 16 removed `next lint` and the `eslint` config option entirely —
  // `next build` no longer runs lint at all, so this key is now a no-op
  // (and Next.js 16.2.6 logs an "unrecognized key" warning on every build
  // for having it). Run `npx eslint .` directly/in CI instead.
  typescript: { ignoreBuildErrors: true },
  // reactCompiler was promoted from `experimental.reactCompiler` to a
  // stable, top-level option in Next.js 16. Leaving it nested under
  // `experimental` (as it was here, and in the now-removed next.config.ts)
  // means it's silently never actually applied — Next 16.2.6 logs an
  // "unrecognized key" warning and falls back to no compiler optimization.
  reactCompiler: true,
  // Image optimisation — serve WebP/AVIF automatically
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60,
  },
  // Security headers on every route
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  compress: true,
};

export default nextConfig;

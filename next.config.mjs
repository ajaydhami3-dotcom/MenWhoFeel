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
  // reactCompiler must be a top-level key (Next.js 16 promoted it from
  // `experimental.reactCompiler`) or Next 16.2.6 logs an "unrecognized
  // key" warning and silently skips it. Explicitly set to false: it's
  // still "use with caution" experimental per Vercel's own build output,
  // and a known category of bug for exactly this symptom — components
  // render fine (server HTML is visible) but interactivity silently
  // breaks with no console error. A past session correctly diagnosed it
  // as a likely cause of a sitewide unclickable-links bug and tried to
  // disable it, but wrote the change into next.config.ts, which Next.js
  // never actually loads alongside this file — so it stayed silently
  // enabled in production the whole time. Fixed here for real.
  // next.config.ts has been deleted; this is the only config file now.
  reactCompiler: false,
  experimental: {
    serverActions: {
      // Next.js caps every Server Action POST body at 1 MB by default —
      // enforced by the framework itself, BEFORE any Server Action's own
      // code runs. The featured-image upload (FeaturedImageField.tsx ->
      // uploadFeaturedImageAction in src/app/admin/(protected)/intel/actions.ts)
      // is a Server Action that receives the raw image File, so without
      // this override every image at or above ~1MB was rejected by Next.js
      // itself — the action's own "must be under 5MB" check never even ran.
      // 6mb leaves headroom above the app's 5MB limit (see
      // src/lib/constants/file-size.ts, the single source of truth for that
      // number) for multipart/form-data framing overhead, so a file that
      // legitimately passes the app's 5MB check is never rejected by this
      // ceiling first. If MAX_FEATURED_IMAGE_SIZE_MB there ever changes,
      // this must be raised to stay comfortably above it.
      bodySizeLimit: "6mb",
    },
  },
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

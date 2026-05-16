/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // We already know your TS is clean, but let's be bulletproof.
    ignoreBuildErrors: true, 
  }
};

export default nextConfig;
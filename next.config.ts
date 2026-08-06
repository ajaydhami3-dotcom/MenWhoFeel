import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disabled: reactCompiler is still "use with caution" experimental
  // (per Vercel's own build output), and is a known category of bug for
  // silent hydration/interactivity breakage with no console error — it's
  // a pure optimization layer on top of normal React, not core logic, so
  // turning it off is strictly safer, never a correctness risk.
  reactCompiler: false,
};

export default nextConfig;

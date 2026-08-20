import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Force SWC to downlevel modern JavaScript to ES5/ES2017 for iOS 15
    forceSwcTransforms: true,
  },
  // Transpile these packages (they often ship modern syntax)
  transpilePackages: [
    'lucide-react',    // your icon library
    'recharts',        // your chart library
    'framer-motion',   // animation library (if used)
    // add any other UI libraries that might cause issues
  ],
  // If you're using server components, this helps with older browsers
  // Optional: disable the modern `fetch` cache behavior
  // experimental: { ... } already includes forceSwcTransforms
};

export default nextConfig;
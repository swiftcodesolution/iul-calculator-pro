import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: ["iul-calculator-pro-nu.vercel.app/", "localhost:3000"], // Add your production domain
    },
  },
  eslint: {
    ignoreDuringBuilds: true, // Skips ESLint during Vercel build
  },
};

export default nextConfig;

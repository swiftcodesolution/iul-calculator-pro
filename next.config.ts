// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   output: "standalone",
//   experimental: {
//     serverActions: {
//       allowedOrigins: ["iul-calculator-pro-nu.vercel.app/", "localhost:3000"], // Add your production domain
//     },
//   },
//   eslint: {
//     ignoreDuringBuilds: true, // Skips ESLint during Vercel build
//   },
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "x1pmtwto3h70vgs8.public.blob.vercel-storage.com",
//         port: "",
//         pathname: "/**",
//       },
//     ],
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: ["iul-calculator-pro-nu.vercel.app", "localhost:3000"],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "x1pmtwto3h70vgs8.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig);

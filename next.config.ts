import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [new URL("https://tronclass.ntou.edu.tw:443/**")],
  },
};

export default nextConfig;

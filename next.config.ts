import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/webTesis',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

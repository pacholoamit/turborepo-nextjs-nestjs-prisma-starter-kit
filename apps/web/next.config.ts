import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable transpilation of workspace packages
  transpilePackages: ['@repo/database'],
  
  // Enable experimental features for monorepo support
  experimental: {
    externalDir: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.slack-edge.com',
      },
      {
        protocol: 'https',
        hostname: 'logos-world.net',
      },
      {
        protocol: 'https',
        hostname: 'github.githubassets.com',
      },
      {
        protocol: 'https',
        hostname: 'assets-global.website-files.com',
      },
      {
        protocol: 'https',
        hostname: 'asset.brandfetch.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
    ],
  },
};

export default nextConfig;

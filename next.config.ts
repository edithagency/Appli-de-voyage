import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Par défaut 1mb — trop petit pour une photo prise au téléphone (avatar, documents).
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;

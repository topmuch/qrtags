import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  productionBrowserSourceMaps: true,
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    formats: ['image/webp'],
    qualities: [75, 90],
  },
  serverExternalPackages: ['bcryptjs', 'archiver', 'nodemailer', 'qrcode', 'pdfkit'],
};

export default nextConfig;

import type { NextConfig } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const hostWithPort = appUrl.replace(/^https?:\/\//, ""); // Ambil domain/IP + port
const hostOnly = hostWithPort.split(":")[0]; // Ambil domain/IP-nya saja tanpa port
const uploadThingHost = "vg8cimg109.ufs.sh";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    minimumCacheTTL: 2_678_400,
    formats: ["image/webp"],
    qualities: [75],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2400],
    imageSizes: [96, 128, 160, 256, 384, 512],
    remotePatterns: [
      {
        protocol: "https",
        hostname: uploadThingHost,
        port: "",
        pathname: "/f/**",
        search: "",
      },
    ],
  },
  // Solusi Elegan untuk Server Actions Origin & Cross-Origin Dev Access
  experimental: {
    serverActions: {
      allowedOrigins: [hostWithPort, "localhost:3000"],
    },
  },
  allowedDevOrigins: process.env.NODE_ENV === "development" ? [hostOnly] : [],
};

export default nextConfig;

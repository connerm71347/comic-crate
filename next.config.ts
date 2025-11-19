import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.gamespot.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "static.dc.com" },
      // add any other domains your mock/real covers use
    ],
  },
};
module.exports = nextConfig;

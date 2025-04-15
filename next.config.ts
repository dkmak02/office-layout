import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://hourworktest:5000/:path*",
      },
    ];
  },
};

export default nextConfig;

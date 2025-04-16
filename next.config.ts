import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* config options here */
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "http://HOURWORKTEST.andea.com:5000/:path*",
  //     },
  //   ];
  // },
};

export default nextConfig;

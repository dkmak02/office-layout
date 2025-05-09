import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: [
        // Existing entries
        "http://172.16.3.234:3000",
        "http://localhost:3000",
        "http://hourworktest:3000",
        "172.16.3.234:3000",
        "172.16.3.234:4431",
        "localhost:4431",
        "hourworktest:3000",
        "https://deskhub/",
        "https://deskhub.andea.com",
        "https://172.16.3.202:443",
        "deskhub/",
        "deskhub.andea.com",
        "172.16.3.202:443",

        // New entries from error message
        "deskhub",
        "172.16.3.202:4431",

        // Additional variations for completeness
        "http://deskhub",
        "https://deskhub",
        "http://172.16.3.202:4431",
        "https://172.16.3.202:4431",
      ],
    },
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

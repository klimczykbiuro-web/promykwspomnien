import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.promykwspomnien.pl",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
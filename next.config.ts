import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Story mode used to live at /story and was deployed there, so any link
      // already shared keeps working. Permanent, because the move is settled.
      { source: "/story", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;

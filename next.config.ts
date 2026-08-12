import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Article and project artwork is uploaded to Vercel Blob (see
    // app/api/upload/route.ts), which serves each store from its own
    // subdomain. Nothing else may be optimized: an open allowlist lets anyone
    // run arbitrary images through the optimizer on our bill.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        port: "",
        search: "",
      },
    ],
  },
};

export default nextConfig;

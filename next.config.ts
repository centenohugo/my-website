import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // File tracing misses libvips, the shared library sharp links against at
  // load time, so without this both routes fail with a 500 on Vercel.
  outputFileTracingIncludes: {
    "/api/upload": ["./node_modules/@img/sharp-*linux-x64/**/*"],
    "/api/profile/photo": ["./node_modules/@img/sharp-*linux-x64/**/*"],
  },
  async redirects() {
    // About became the home page and the project list lives below it; keep
    // old links and bookmarks working.
    return [
      { source: "/about", destination: "/", permanent: true },
      { source: "/projects", destination: "/#projects", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/projects/:slug.md", destination: "/markdown/projects/:slug" },
    ];
  },
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

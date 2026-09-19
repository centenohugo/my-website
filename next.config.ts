import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Markdown mirrors live at the content URL with `.md` appended, the shape
    // agents and llms.txt readers probe for. Array-form rewrites are matched
    // before dynamic routes, so `/blog/foo.md` never reaches `/blog/[slug]`.
    return [
      { source: "/blog/:slug.md", destination: "/markdown/blog/:slug" },
      { source: "/projects/:slug.md", destination: "/markdown/projects/:slug" },
    ];
  },
};

export default nextConfig;

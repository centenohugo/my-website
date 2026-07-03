"use client";

import { useEffect, useRef, useState } from "react";
import PostCard, { type Post } from "./PostCard";
import { blogColors, blogLayout, blogScrollBehavior, blogTypography } from "./theme";

export default function BlogGrid({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [isDone, setIsDone] = useState(
    initialPosts.length < blogScrollBehavior.initialCount
  );
  const loadingRef = useRef(false);

  useEffect(() => {
    async function handleScroll() {
      if (loadingRef.current || isDone) return;

      const scrollBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollBottom >= documentHeight - blogScrollBehavior.thresholdPx) {
        loadingRef.current = true;
        try {
          const res = await fetch(
            `/api/posts?limit=${blogScrollBehavior.loadMoreCount}&offset=${posts.length}`
          );
          const more: Post[] = await res.json();
          setPosts((prev) => [...prev, ...more]);
          if (more.length < blogScrollBehavior.loadMoreCount) {
            setIsDone(true);
          }
        } finally {
          loadingRef.current = false;
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [posts.length, isDone]);

  return (
    <div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        style={{ gap: blogLayout.gridGapComfortable }}
      >
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      <div
        className="py-12 text-center uppercase"
        style={{
          ...blogTypography.scrollIndicator,
          color: isDone ? blogColors.archiveEndMono : blogColors.loadingMono,
        }}
      >
        {isDone ? "Fin del archivo" : "Cargando más ·"}
      </div>
    </div>
  );
}

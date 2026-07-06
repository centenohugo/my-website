"use client";

import InfiniteCardGrid from "../InfiniteCardGrid";
import PostCard, { type Post } from "./PostCard";
import { blogColors, blogLayout, blogScrollBehavior, blogTypography } from "./theme";

export default function BlogGrid({ initialPosts }: { initialPosts: Post[] }) {
  return (
    <InfiniteCardGrid
      stateKey="nav:blogGridState"
      initialItems={initialPosts}
      endpoint="/api/posts"
      initialCount={blogScrollBehavior.initialCount}
      loadMoreCount={blogScrollBehavior.loadMoreCount}
      thresholdPx={blogScrollBehavior.thresholdPx}
      gridGap={blogLayout.gridGapComfortable}
      getKey={(post) => post.slug}
      renderItem={(post) => <PostCard post={post} />}
      doneLabel=""
      loadingLabel="Loading more ·"
      indicatorStyle={blogTypography.scrollIndicator}
      doneColor={blogColors.archiveEndMono}
      loadingColor={blogColors.loadingMono}
    />
  );
}

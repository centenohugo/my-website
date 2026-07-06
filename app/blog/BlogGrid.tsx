"use client";

import { getDictionary } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import InfiniteCardGrid from "../InfiniteCardGrid";
import PostCard, { type Post } from "./PostCard";
import { blogColors, blogLayout, blogScrollBehavior, blogTypography } from "./theme";

export default function BlogGrid({ initialPosts }: { initialPosts: Post[] }) {
  const { locale } = useLocale();
  const t = getDictionary(locale);

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
      loadingLabel={t.blog.loadingMore}
      indicatorStyle={blogTypography.scrollIndicator}
      doneColor={blogColors.archiveEndMono}
      loadingColor={blogColors.loadingMono}
    />
  );
}

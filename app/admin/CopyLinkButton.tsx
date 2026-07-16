"use client";

import { useRef, useState } from "react";
import { adminTypography } from "./theme";

export default function CopyLinkButton({
  publicHrefBase,
  slug,
  shareToken,
  status,
}: {
  publicHrefBase: string;
  slug: string;
  shareToken: string;
  status: "draft" | "published";
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleCopy() {
    // Drafts are only visible through the tokenized share link; published
    // entries just get their plain public URL.
    const path = `${publicHrefBase}/${slug}`;
    const url =
      status === "draft"
        ? `${location.origin}${path}?share=${shareToken}`
        : `${location.origin}${path}`;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="uppercase"
      style={{ ...adminTypography.buttonSecondary, cursor: "pointer" }}
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

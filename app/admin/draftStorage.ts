// Crash recovery for the admin editor. Nothing here talks to the database:
// these snapshots live in localStorage so closing the browser mid-article
// doesn't lose the text, and they are always *offered* on the next visit rather
// than applied, so a recovered draft can never silently overwrite what is
// already saved (or, worse, already published).

import type { ContentFormInitialData, ContentStage } from "./ContentForm";

export type DraftSnapshot = {
  title: string;
  subtitle: string;
  content: string;
  status: "draft" | "published";
  date: string;
  imageUrl: string;
  repoUrl: string;
  liveUrl: string;
  stage: ContentStage;
  titleEs: string;
  subtitleEs: string;
  contentEs: string;
  assetPrefix: string;
};

export type StoredDraft = {
  version: number;
  savedAt: number;
  snapshot: DraftSnapshot;
};

// Bumped whenever DraftSnapshot changes shape. Older payloads are dropped
// rather than migrated — a stale recovery offer is worth less than the risk of
// restoring half a form.
const VERSION = 1;

/**
 * One slot per form identity: the new-post form, plus one per existing slug.
 * Editing a post and editing a project of the same slug are different slots.
 */
export function draftKey(
  kind: "post" | "project",
  mode: "create" | "edit",
  slug?: string
) {
  return mode === "create" ? `draft:${kind}:new` : `draft:${kind}:${slug}`;
}

/** The snapshot a freshly-opened form starts from, used as the dirty baseline. */
export function baselineSnapshot(
  initialData: ContentFormInitialData | undefined,
  assetPrefix: string,
  date: string
): DraftSnapshot {
  return {
    title: initialData?.title ?? "",
    subtitle: initialData?.subtitle ?? "",
    content: initialData?.content ?? "",
    status: initialData?.status ?? "draft",
    date,
    imageUrl: initialData?.image_url ?? "",
    repoUrl: initialData?.repo_url ?? "",
    liveUrl: initialData?.live_url ?? "",
    stage: initialData?.stage ?? "in_progress",
    titleEs: initialData?.title_es ?? "",
    subtitleEs: initialData?.subtitle_es ?? "",
    contentEs: initialData?.content_es ?? "",
    assetPrefix,
  };
}

// What localStorage held when a form first looked, frozen for as long as that
// form is mounted. The editor renders the recovery banner off this, so it keeps
// showing the text from before the crash instead of following the autosave that
// is overwriting it a second at a time. Cleared when the form unmounts or the
// draft is resolved, so the next visit reads storage afresh.
const observed = new Map<string, StoredDraft | null>();

export function observeDraft(key: string): StoredDraft | null {
  if (!observed.has(key)) observed.set(key, readDraft(key));
  return observed.get(key) ?? null;
}

export function forgetObservedDraft(key: string) {
  observed.delete(key);
}

function readDraft(key: string): StoredDraft | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredDraft;
    if (parsed?.version !== VERSION || !parsed.snapshot) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    // Corrupt JSON, or localStorage unavailable (private mode, blocked
    // cookies). Recovery is best-effort; never break the editor over it.
    return null;
  }
}

/** Returns false when the write failed — the caller surfaces that to the user. */
export function writeDraft(key: string, snapshot: DraftSnapshot): boolean {
  try {
    const payload: StoredDraft = { version: VERSION, savedAt: Date.now(), snapshot };
    window.localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch {
    // Almost always QuotaExceededError on a very long article.
    return false;
  }
}

export function clearDraft(key: string) {
  forgetObservedDraft(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Nothing to do; the stale draft will simply be offered again.
  }
}

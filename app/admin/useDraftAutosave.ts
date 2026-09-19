"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  clearDraft,
  forgetObservedDraft,
  observeDraft,
  writeDraft,
  type DraftSnapshot,
} from "./draftStorage";

const DEBOUNCE_MS = 800;

/**
 * Mirrors the editor into localStorage so a closed browser doesn't lose the
 * article, and hands back whatever was found there on mount.
 *
 * The recovered snapshot is read once and kept in memory, so autosave keeps
 * running while the restore banner is on screen: the stored copy follows what
 * you are typing now (newest wins if the browser dies again), while the banner
 * can still restore the older text from memory for as long as the page lives.
 */
export function useDraftAutosave({
  storageKey,
  snapshot,
  isDirty,
}: {
  storageKey: string;
  snapshot: DraftSnapshot;
  isDirty: boolean;
}) {
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [stopped, setStopped] = useState(false);

  // localStorage is an external store. observeDraft freezes what it found on
  // the first read, so the snapshot identity is stable across renders and never
  // needs to notify; the null server snapshot keeps the recovery banner out of
  // the SSR markup, so hydration still matches.
  const store = useMemo(
    () => ({
      subscribe: () => () => forgetObservedDraft(storageKey),
      getSnapshot: () => observeDraft(storageKey),
      getServerSnapshot: () => null,
    }),
    [storageKey]
  );

  const found = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  const recovered: DraftSnapshot | null = dismissed ? null : found?.snapshot ?? null;
  const recoveredAt: number | null = dismissed ? null : found?.savedAt ?? null;

  // Read by the flush-on-exit listener, which must not be re-registered on
  // every keystroke.
  const pendingRef = useRef<DraftSnapshot | null>(null);
  useEffect(() => {
    pendingRef.current = isDirty && !stopped ? snapshot : null;
  }, [snapshot, isDirty, stopped]);

  // A pristine form writes nothing, so merely opening an article never leaves a
  // draft behind to be offered back on the next visit.
  useEffect(() => {
    if (!isDirty || stopped) return;

    const timer = window.setTimeout(() => {
      const ok = writeDraft(storageKey, snapshot);
      setFailed(!ok);
      if (ok) setSavedAt(Date.now());
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [storageKey, snapshot, isDirty, stopped]);

  // The debounce window is the one gap where work can still be lost, so commit
  // immediately when the tab is being hidden or torn down.
  useEffect(() => {
    function flush() {
      const pending = pendingRef.current;
      if (pending) writeDraft(storageKey, pending);
    }

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, [storageKey]);

  const dismissRecovered = useCallback(() => {
    setDismissed(true);
  }, []);

  /** Throw away the recovered draft; editing from here on autosaves as normal. */
  const discard = useCallback(() => {
    clearDraft(storageKey);
    pendingRef.current = null;
    setSavedAt(null);
    dismissRecovered();
  }, [storageKey, dismissRecovered]);

  /**
   * The article is in the database — drop the copy and stop autosaving. Setting
   * `stopped` also cancels the debounce still in flight, so saving within a
   * second of the last keystroke can't write the draft back after it was
   * cleared and resurrect it on the next visit.
   */
  const finish = useCallback(() => {
    setStopped(true);
    discard();
  }, [discard]);

  return {
    recovered,
    recoveredAt,
    savedAt,
    failed,
    dismissRecovered,
    discard,
    finish,
  };
}

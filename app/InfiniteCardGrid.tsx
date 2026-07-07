"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

type StoredState<T> = {
  items: T[];
  isDone: boolean;
  scrollY: number;
};

function readStoredState<T>(stateKey: string): StoredState<T> | null {
  try {
    const raw = sessionStorage.getItem(stateKey);
    return raw ? (JSON.parse(raw) as StoredState<T>) : null;
  } catch {
    return null;
  }
}

function writeStoredState<T>(stateKey: string, state: StoredState<T>) {
  try {
    sessionStorage.setItem(stateKey, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable (private mode, etc.) — restoring on back just won't work
  }
}

function dedupeByKey<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export default function InfiniteCardGrid<T>({
  stateKey,
  initialItems,
  endpoint,
  initialCount,
  loadMoreCount,
  thresholdPx,
  gridGap,
  getKey,
  renderItem,
  doneLabel,
  loadingLabel,
  indicatorStyle,
  doneColor,
  loadingColor,
}: {
  stateKey: string;
  initialItems: T[];
  endpoint: string;
  initialCount: number;
  loadMoreCount: number;
  thresholdPx: number;
  gridGap: string;
  getKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  doneLabel: string;
  loadingLabel: string;
  indicatorStyle: CSSProperties;
  doneColor: string;
  loadingColor: string;
}) {
  const [restoredState] = useState(() => {
    if (typeof window === "undefined") return null;
    const [navEntry] = performance.getEntriesByType("navigation");
    const isBackForward =
      navEntry instanceof PerformanceNavigationTiming && navEntry.type === "back_forward";
    return isBackForward ? readStoredState<T>(stateKey) : null;
  });
  const [items, setItems] = useState(() =>
    dedupeByKey(restoredState?.items ?? initialItems, getKey)
  );
  const [isDone, setIsDone] = useState(
    restoredState?.isDone ?? initialItems.length < initialCount
  );
  const loadingRef = useRef(false);
  const hasRestoredScroll = useRef(false);
  const itemsRef = useRef(items);
  const isDoneRef = useRef(isDone);
  const isFirstPersist = useRef(true);
  // Set the instant the user clicks into an item, before Next's own
  // navigation/scroll handling has a chance to move window.scrollY. Once set,
  // every other write path below is frozen — otherwise the outgoing
  // "scroll to top" transition fires real scroll events on this
  // still-mounted grid, and a throttled rAF write reads window.scrollY late
  // enough to capture the already-reset 0, clobbering the position we need
  // to restore to on the way back.
  const isLeaving = useRef(false);

  // Runs a frame late so it wins any race against Next's own scroll handling
  // (e.g. the "scroll to top" it does for <Link> navigations that aren't a real back()).
  useEffect(() => {
    if (!restoredState || hasRestoredScroll.current) return;
    hasRestoredScroll.current = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, restoredState.scrollY);
      });
    });
  }, [restoredState]);

  useEffect(() => {
    itemsRef.current = items;
    isDoneRef.current = isDone;
    // Skip the mount-time run: window.scrollY is still 0 here because the
    // restore effect above hasn't scrolled yet (it's deferred by two rAFs),
    // so writing it now would clobber the scrollY we're about to restore to.
    if (isFirstPersist.current) {
      isFirstPersist.current = false;
      return;
    }
    if (isLeaving.current) return;
    writeStoredState(stateKey, { items, isDone, scrollY: window.scrollY });
  }, [items, isDone, stateKey]);

  useEffect(() => {
    let ticking = false;

    async function handleScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          if (!isLeaving.current) {
            writeStoredState(stateKey, {
              items: itemsRef.current,
              isDone: isDoneRef.current,
              scrollY: window.scrollY,
            });
          }
          ticking = false;
        });
      }

      if (loadingRef.current || isDoneRef.current) return;

      const scrollBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollBottom >= documentHeight - thresholdPx) {
        loadingRef.current = true;
        try {
          const res = await fetch(
            `${endpoint}?limit=${loadMoreCount}&offset=${itemsRef.current.length}`
          );
          const more: T[] = await res.json();
          setItems((prev) => {
            const seen = new Set(prev.map(getKey));
            const deduped = more.filter((item) => !seen.has(getKey(item)));
            const next = [...prev, ...deduped];
            itemsRef.current = next;
            return next;
          });
          if (more.length < loadMoreCount) {
            isDoneRef.current = true;
            setIsDone(true);
          }
        } finally {
          loadingRef.current = false;
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [endpoint, loadMoreCount, thresholdPx, stateKey]);

  function handleGridClickCapture(event: React.MouseEvent) {
    if (!(event.target instanceof Element) || !event.target.closest("a")) return;
    isLeaving.current = true;
    writeStoredState(stateKey, {
      items: itemsRef.current,
      isDone: isDoneRef.current,
      scrollY: window.scrollY,
    });
  }

  return (
    <div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        style={{ gap: gridGap }}
        onClickCapture={handleGridClickCapture}
      >
        {items.map((item) => (
          <div key={getKey(item)}>{renderItem(item)}</div>
        ))}
      </div>

      <div
        className="py-12 text-center uppercase"
        style={{ ...indicatorStyle, color: isDone ? doneColor : loadingColor }}
      >
        {isDone ? doneLabel : loadingLabel}
      </div>
    </div>
  );
}

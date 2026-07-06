"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    twttr?: { widgets: { load: (el?: HTMLElement) => void } };
  }
}

// X's embed script is loaded once and reused across every SourceTweetEmbed
// instance on the page, rather than once per card.
let widgetsScriptPromise: Promise<void> | null = null;

function loadTwitterWidgetsScript(): Promise<void> {
  if (!widgetsScriptPromise) {
    widgetsScriptPromise = new Promise((resolve) => {
      if (window.twttr) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }
  return widgetsScriptPromise;
}

// X's widget script is documented as intermittently failing to convert the
// fallback <a> into an iframe on first try (a known 2026 reliability issue,
// not specific to this app) — a few retries clears most of those misses.
const LOAD_RETRY_DELAYS_MS = [1000, 2500, 5000];

export function SourceTweetEmbed({ handle }: { handle: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Defaults to "light" for a hydration-safe first render (no `window` on
  // the server); flips to the real preference once mounted in the browser.
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Reading the media query must wait until mount (no `window` on the
    // server), so this can't be done via a useState lazy initializer.
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function attemptLoad() {
      if (cancelled || !containerRef.current || !window.twttr) return;
      // Already converted to an iframe — nothing left to retry.
      if (!containerRef.current.querySelector("a.twitter-timeline")) return;
      window.twttr.widgets.load(containerRef.current);
    }

    loadTwitterWidgetsScript().then(() => {
      attemptLoad();
      for (const delay of LOAD_RETRY_DELAYS_MS) {
        timers.push(setTimeout(attemptLoad, delay));
      }
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // Re-run when `theme` settles so the widget is created with the right
    // theme rather than needing a second load() pass.
  }, [theme]);

  return (
    <div ref={containerRef}>
      <a
        className="twitter-timeline text-blue-600 underline dark:text-blue-400"
        data-height="400"
        data-tweet-limit="3"
        data-theme={theme}
        href={`https://x.com/${handle}?ref_src=twsrc%5Etfw`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View @{handle}&apos;s recent posts on X ↗
      </a>
    </div>
  );
}

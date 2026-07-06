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
    loadTwitterWidgetsScript().then(() => {
      if (!cancelled && containerRef.current && window.twttr) {
        window.twttr.widgets.load(containerRef.current);
      }
    });
    return () => {
      cancelled = true;
    };
    // Re-run when `theme` settles so the widget is created with the right
    // theme rather than needing a second load() pass.
  }, [theme]);

  return (
    <div ref={containerRef}>
      <a
        className="twitter-timeline"
        data-height="400"
        data-tweet-limit="3"
        data-theme={theme}
        href={`https://twitter.com/${handle}?ref_src=twsrc%5Etfw`}
      >
        Tweets by @{handle}
      </a>
    </div>
  );
}

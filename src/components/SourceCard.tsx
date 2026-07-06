"use client";

import { useState } from "react";
import { SourceTweetEmbed } from "@/components/SourceTweetEmbed";
import type { SourceAccount } from "@/data/sources";

export function SourceCard({ name, handle, outlet, blurb }: SourceAccount) {
  const [everOpened, setEverOpened] = useState(false);

  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <a
        href={`https://x.com/${handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
      >
        {name}
      </a>
      <span className="text-zinc-500 dark:text-zinc-400"> · @{handle}</span>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{outlet}</p>
      <p className="mt-1 text-zinc-700 dark:text-zinc-300">{blurb}</p>

      <details
        className="mt-3"
        onToggle={(e) => {
          if (e.currentTarget.open) setEverOpened(true);
        }}
      >
        <summary className="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400">
          Recent Tweets
        </summary>
        <div className="mt-3">{everOpened && <SourceTweetEmbed handle={handle} />}</div>
      </details>
    </li>
  );
}

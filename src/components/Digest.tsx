"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Game, LeagueDigest } from "@/lib/sports";

const FAVORITES_KEY = "adhd-digest:favorites";

function teamKey(league: string, abbreviation: string) {
  return `${league}:${abbreviation}`;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function statusBadge(game: Game) {
  if (game.state === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
        {game.statusDetail || "Live"}
      </span>
    );
  }
  if (game.state === "final") {
    return (
      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        Final
      </span>
    );
  }
  return (
    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
      {formatTime(game.startTime)}
    </span>
  );
}

function GameRow({
  game,
  isFavorite,
  onToggleFavorite,
}: {
  game: Game;
  isFavorite: (abbr: string) => boolean;
  onToggleFavorite: (abbr: string) => void;
}) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-1 flex-col gap-1.5">
        {[game.away, game.home].map((team) => (
          <div key={team.abbreviation} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavorite(team.abbreviation)}
              aria-label={
                isFavorite(team.abbreviation)
                  ? `Remove ${team.name} from favorites`
                  : `Add ${team.name} to favorites`
              }
              className="text-lg leading-none text-zinc-300 hover:text-amber-500 dark:text-zinc-700"
            >
              {isFavorite(team.abbreviation) ? (
                <span className="text-amber-500">★</span>
              ) : (
                "☆"
              )}
            </button>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {team.name}
            </span>
            {team.score !== null && (
              <span
                className={`ml-auto tabular-nums ${
                  team.winner
                    ? "font-bold text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 dark:text-zinc-500"
                }`}
              >
                {team.score}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="shrink-0">{statusBadge(game)}</div>
    </li>
  );
}

function sortGames(games: Game[]) {
  const rank = { live: 0, pre: 1, final: 2 } as const;
  return [...games].sort((a, b) => {
    if (rank[a.state] !== rank[b.state]) return rank[a.state] - rank[b.state];
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
}

export function Digest({
  digests,
  dateLabel,
}: {
  digests: LeagueDigest[];
  dateLabel: string;
}) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FAVORITES_KEY);
      // Reading localStorage must wait until mount (it's unavailable during SSR),
      // so favorites can't be set via a useState lazy initializer instead.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setFavorites(new Set(JSON.parse(stored)));
    } catch {
      // ignore corrupt local storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  }, [favorites, hydrated]);

  function toggleFavorite(league: string, abbreviation: string) {
    const key = teamKey(league, abbreviation);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const favoriteGames = digests
    .flatMap((d) => d.games.map((g) => ({ digest: d, game: g })))
    .filter(
      ({ digest, game }) =>
        favorites.has(teamKey(digest.league, game.home.abbreviation)) ||
        favorites.has(teamKey(digest.league, game.away.abbreviation)),
    );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Today&apos;s Digest
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">{dateLabel}</p>
        </div>
        <Link
          href="/podcast-prep"
          className="shrink-0 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Podcast Prep →
        </Link>
      </header>

      {hydrated && favoriteGames.length > 0 && (
        <section className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-950/40">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-900 dark:text-amber-200">
            <span className="text-amber-500">★</span> Your Teams
          </h2>
          <ul className="flex flex-col gap-3">
            {sortGames(favoriteGames.map((f) => f.game)).map((game) => (
              <GameRow
                key={game.id}
                game={game}
                isFavorite={(abbr) => favorites.has(teamKey(game.league, abbr))}
                onToggleFavorite={(abbr) => toggleFavorite(game.league, abbr)}
              />
            ))}
          </ul>
        </section>
      )}

      {digests.map((digest) => (
        <section key={digest.league}>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {digest.label}
          </h2>
          {digest.error && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Couldn&apos;t load {digest.label} games right now.
            </p>
          )}
          {!digest.error && digest.games.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No games today.
            </p>
          )}
          {!digest.error && digest.games.length > 0 && (
            <ul className="flex flex-col gap-3">
              {sortGames(digest.games).map((game) => (
                <GameRow
                  key={game.id}
                  game={game}
                  isFavorite={(abbr) => favorites.has(teamKey(digest.league, abbr))}
                  onToggleFavorite={(abbr) => toggleFavorite(digest.league, abbr)}
                />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

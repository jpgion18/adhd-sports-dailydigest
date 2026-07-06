"use client";

import { useEffect, useState } from "react";
import type { BoxScoreResult, LeagueKey } from "@/lib/sports";

export function GameBoxScore({
  league,
  eventId,
  awayAbbr,
  homeAbbr,
}: {
  league: LeagueKey;
  eventId: string;
  awayAbbr: string;
  homeAbbr: string;
}) {
  const [data, setData] = useState<BoxScoreResult | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(
      `/api/boxscore?league=${league}&eventId=${eventId}&away=${awayAbbr}&home=${homeAbbr}`,
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bad response"))))
      .then((json: BoxScoreResult) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [league, eventId, awayAbbr, homeAbbr]);

  if (failed) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Couldn&apos;t load stats for this game.
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading stats…</p>
    );
  }

  if (data.teamStats.length === 0 && data.topPerformers.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No stats available for this game yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.teamStats.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 dark:text-zinc-400">
              <th className="text-left font-normal" />
              <th className="text-right font-normal">{awayAbbr}</th>
              <th className="text-right font-normal">{homeAbbr}</th>
            </tr>
          </thead>
          <tbody>
            {data.teamStats.map((row, i) => (
              <tr key={i} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="py-1 pr-2 text-zinc-600 dark:text-zinc-400">{row.label}</td>
                <td className="py-1 text-right tabular-nums text-zinc-900 dark:text-zinc-100">
                  {row.away}
                </td>
                <td className="py-1 text-right tabular-nums text-zinc-900 dark:text-zinc-100">
                  {row.home}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {data.topPerformers.length > 0 && (
        <ul className="flex flex-col gap-1">
          {data.topPerformers.map((leader, i) => (
            <li key={i} className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="text-zinc-500 dark:text-zinc-400">
                {leader.team ? `${leader.team} ` : ""}
                {leader.label}:{" "}
              </span>
              {leader.playerName} — {leader.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

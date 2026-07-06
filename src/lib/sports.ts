export type LeagueKey = "nfl" | "nba" | "mlb" | "nhl";

export const LEAGUES: { key: LeagueKey; sportPath: string; label: string }[] = [
  { key: "nfl", sportPath: "football/nfl", label: "NFL" },
  { key: "nba", sportPath: "basketball/nba", label: "NBA" },
  { key: "mlb", sportPath: "baseball/mlb", label: "MLB" },
  { key: "nhl", sportPath: "hockey/nhl", label: "NHL" },
];

export type GameState = "pre" | "live" | "final";

export interface TeamInfo {
  abbreviation: string;
  name: string;
  score: number | null;
  winner: boolean;
  /** Season record, e.g. "45-38". Absent if ESPN didn't include one. */
  record: string | null;
}

export interface GameLeader {
  /** Stat category, e.g. "Passing", "Home Runs", "Points". */
  label: string;
  playerName: string;
  /** Team abbreviation the leader plays for, if known. */
  team: string | null;
  /** Pre-formatted value, e.g. "275 YDS, 2 TD" or "3 HR". */
  value: string;
}

export interface Game {
  id: string;
  league: LeagueKey;
  startTime: string;
  state: GameState;
  statusDetail: string;
  home: TeamInfo;
  away: TeamInfo;
  leaders: GameLeader[];
}

export interface LeagueDigest {
  league: LeagueKey;
  label: string;
  games: Game[];
  error: string | null;
}

interface EspnLeaderCategory {
  name?: string;
  displayName?: string;
  leaders?: { displayValue?: string; athlete?: { displayName?: string } }[];
}

interface EspnCompetitor {
  homeAway: "home" | "away";
  score?: string;
  winner?: boolean;
  team?: { abbreviation?: string; displayName?: string; shortDisplayName?: string };
  records?: { type?: string; summary?: string }[];
  leaders?: EspnLeaderCategory[];
}

interface EspnEvent {
  id: string;
  date: string;
  status?: {
    type?: { state?: string; shortDetail?: string; detail?: string };
  };
  competitions?: {
    competitors?: EspnCompetitor[];
    status?: { type?: { state?: string; shortDetail?: string; detail?: string } };
    leaders?: EspnLeaderCategory[];
  }[];
}

interface EspnScoreboardResponse {
  events?: EspnEvent[];
}

function toGameState(state: string | undefined): GameState {
  if (state === "in") return "live";
  if (state === "post") return "final";
  return "pre";
}

function toTeamInfo(competitor: EspnCompetitor | undefined): TeamInfo {
  const record =
    competitor?.records?.find((r) => r.type === "total")?.summary ??
    competitor?.records?.[0]?.summary ??
    null;

  return {
    abbreviation: competitor?.team?.abbreviation ?? "?",
    name:
      competitor?.team?.shortDisplayName ??
      competitor?.team?.displayName ??
      "Unknown",
    score: competitor?.score !== undefined ? Number(competitor.score) : null,
    winner: competitor?.winner ?? false,
    record,
  };
}

// ESPN puts stat leaders either per-team (competitor.leaders, the common
// case) or shared across the whole game (competition.leaders) depending on
// the sport/season — try per-team first and fall back to the shared list,
// since we can't be sure which shape a given league/date will return.
function extractLeaders(
  competition: { leaders?: EspnLeaderCategory[] } | undefined,
  home: EspnCompetitor | undefined,
  away: EspnCompetitor | undefined,
): GameLeader[] {
  const fromCategories = (
    categories: EspnLeaderCategory[] | undefined,
    team: string | null,
  ): GameLeader[] =>
    (categories ?? []).flatMap((category) => {
      const top = category.leaders?.[0];
      if (!top?.athlete?.displayName) return [];
      return [
        {
          label: category.displayName ?? category.name ?? "Leader",
          playerName: top.athlete.displayName,
          team,
          value: top.displayValue ?? "",
        },
      ];
    });

  const perTeam = [
    ...fromCategories(away?.leaders, away?.team?.abbreviation ?? null),
    ...fromCategories(home?.leaders, home?.team?.abbreviation ?? null),
  ];
  if (perTeam.length > 0) return perTeam;

  return fromCategories(competition?.leaders, null);
}

// Canonical "today" as YYYY-MM-DD in the podcast's home timezone. Used both
// to pin the ESPN query below and as the date-page redirect target, so the
// scores view and the podcast-prep archive always agree on what day it is.
export function todayISODate(timeZone = "America/New_York"): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// ESPN's scoreboard endpoint defaults to the *next* slate of games when a
// league is out of season (e.g. it'll return September's Week 1 in July)
// instead of returning nothing for that day. Passing an explicit date pins
// it to that day only — this also lets us fetch scores for any past date.
export async function fetchLeagueDigest(
  league: LeagueKey,
  sportPath: string,
  label: string,
  isoDate: string,
): Promise<LeagueDigest> {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard?dates=${isoDate.replaceAll("-", "")}`,
      { next: { revalidate: 60 } },
    );

    if (!res.ok) {
      throw new Error(`ESPN responded with ${res.status}`);
    }

    const data: EspnScoreboardResponse = await res.json();

    const games: Game[] = (data.events ?? []).map((event) => {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors ?? [];
      const home = competitors.find((c) => c.homeAway === "home");
      const away = competitors.find((c) => c.homeAway === "away");
      const statusType = competition?.status?.type ?? event.status?.type;

      return {
        id: event.id,
        league,
        startTime: event.date,
        state: toGameState(statusType?.state),
        statusDetail: statusType?.shortDetail ?? statusType?.detail ?? "",
        home: toTeamInfo(home),
        away: toTeamInfo(away),
        leaders: extractLeaders(competition, home, away),
      };
    });

    return { league, label, games, error: null };
  } catch (err) {
    return {
      league,
      label,
      games: [],
      error: err instanceof Error ? err.message : "Failed to load games",
    };
  }
}

export async function fetchAllDigests(isoDate: string): Promise<LeagueDigest[]> {
  return Promise.all(
    LEAGUES.map(({ key, sportPath, label }) => fetchLeagueDigest(key, sportPath, label, isoDate)),
  );
}

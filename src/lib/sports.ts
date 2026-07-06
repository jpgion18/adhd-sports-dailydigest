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
}

export interface TeamStatRow {
  label: string;
  away: string;
  home: string;
}

export interface BoxScoreResult {
  teamStats: TeamStatRow[];
  topPerformers: GameLeader[];
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
  leaders?: {
    displayValue?: string;
    athlete?: { displayName?: string };
    team?: { abbreviation?: string };
  }[];
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

// ESPN sometimes mirrors the same game-wide leaders list onto both
// competitor.leaders and competition.leaders rather than giving each team
// its own list — reading only one source (in this preference order) and
// deduping by category+player avoids showing every leader twice. Used
// against the box score summary endpoint below, not the scoreboard (the
// scoreboard's own leaders field was the source of that duplication bug).
function extractLeaders(
  competition: { leaders?: EspnLeaderCategory[] } | undefined,
  home: EspnCompetitor | undefined,
  away: EspnCompetitor | undefined,
): GameLeader[] {
  const categories =
    competition?.leaders ?? away?.leaders ?? home?.leaders ?? [];

  const seen = new Set<string>();
  const leaders: GameLeader[] = [];

  for (const category of categories) {
    const top = category.leaders?.[0];
    const playerName = top?.athlete?.displayName;
    if (!playerName) continue;

    const label = category.displayName ?? category.name ?? "Leader";
    const key = `${label}:${playerName}`;
    if (seen.has(key)) continue;
    seen.add(key);

    leaders.push({
      label,
      playerName,
      team: top?.team?.abbreviation ?? null,
      value: top?.displayValue ?? "",
    });
  }

  return leaders;
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

interface EspnBoxscoreTeamStat {
  name?: string;
  label?: string;
  displayValue?: string;
}

interface EspnBoxscoreTeam {
  team?: { abbreviation?: string };
  statistics?: EspnBoxscoreTeamStat[];
}

interface EspnSummaryResponse {
  boxscore?: { teams?: EspnBoxscoreTeam[] };
  leaders?: EspnLeaderCategory[];
}

// A handful of team-level totals (hits/errors, total yards, shooting %,
// shots on goal, etc.) reads better than every stat ESPN tracks, which for
// some sports runs 15+ rows deep.
const MAX_TEAM_STAT_ROWS = 8;

function parseTeamStats(
  teams: EspnBoxscoreTeam[] | undefined,
  awayAbbr: string,
  homeAbbr: string,
): TeamStatRow[] {
  if (!teams || teams.length < 2) return [];

  const away = teams.find((t) => t.team?.abbreviation === awayAbbr) ?? teams[0];
  const home = teams.find((t) => t.team?.abbreviation === homeAbbr) ?? teams[1];
  const homeByName = new Map((home?.statistics ?? []).map((s) => [s.name, s]));

  const rows: TeamStatRow[] = [];
  for (const stat of away?.statistics ?? []) {
    if (rows.length >= MAX_TEAM_STAT_ROWS) break;
    const homeStat = stat.name ? homeByName.get(stat.name) : undefined;
    rows.push({
      label: stat.label ?? stat.name ?? "Stat",
      away: stat.displayValue ?? "—",
      home: homeStat?.displayValue ?? "—",
    });
  }
  return rows;
}

// Fetched on demand (only when a user expands a game's box score), unlike
// the scoreboard above — pulling full box scores for every game up front
// would mean one extra ESPN request per game on every page load.
export async function fetchGameBoxScore(
  league: LeagueKey,
  eventId: string,
  awayAbbr: string,
  homeAbbr: string,
): Promise<BoxScoreResult> {
  const sportPath = LEAGUES.find((l) => l.key === league)?.sportPath;
  if (!sportPath) return { teamStats: [], topPerformers: [] };

  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${eventId}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) throw new Error(`ESPN responded with ${res.status}`);

    const data: EspnSummaryResponse = await res.json();

    return {
      teamStats: parseTeamStats(data.boxscore?.teams, awayAbbr, homeAbbr),
      topPerformers: extractLeaders({ leaders: data.leaders }, undefined, undefined),
    };
  } catch {
    return { teamStats: [], topPerformers: [] };
  }
}

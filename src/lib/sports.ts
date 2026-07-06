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

// Team-level stats are nested two levels deep: each team has category
// blocks (batting/pitching/fielding for MLB, etc.), and each category has
// its own stats[] — not a flat list of {name, displayValue} like the
// scoreboard's team records. Confirmed against a real MLB summary response.
interface EspnBoxscoreStatItem {
  name?: string;
  displayValue?: string;
}

interface EspnBoxscoreCategory {
  name?: string;
  stats?: EspnBoxscoreStatItem[];
}

interface EspnBoxscoreTeam {
  team?: { abbreviation?: string };
  statistics?: EspnBoxscoreCategory[];
}

// Per-player box score: category.type identifies "batting"/"pitching"/etc,
// labels are parallel to each athlete's stats array (index-matched, e.g.
// labels[3] === "H" pairs with athlete.stats[3] being that player's hit
// count) rather than each stat being individually named.
interface EspnBoxscoreAthleteLine {
  athlete?: { displayName?: string };
  stats?: string[];
}

interface EspnBoxscorePlayerCategory {
  type?: string;
  labels?: string[];
  athletes?: EspnBoxscoreAthleteLine[];
}

interface EspnBoxscorePlayerTeam {
  team?: { abbreviation?: string };
  statistics?: EspnBoxscorePlayerCategory[];
}

interface EspnSummaryResponse {
  boxscore?: { teams?: EspnBoxscoreTeam[]; players?: EspnBoxscorePlayerTeam[] };
  leaders?: EspnLeaderCategory[];
}

// A curated handful of team totals per league/category — showing every
// stat ESPN tracks (MLB's "batting" category alone has ~55) would bury the
// few anyone actually cares about. NFL/NBA/NHL entries are best-effort
// guesses at ESPN's likely naming and unverified against a live box score
// (those leagues are out of season); a wrong guess just silently produces
// no row for that stat rather than a broken one, so it's safe to leave
// until someone checks a real game.
const KEY_TEAM_STATS: Record<LeagueKey, { category: string; stat: string; label: string }[]> = {
  mlb: [
    { category: "batting", stat: "hits", label: "Hits" },
    { category: "batting", stat: "homeRuns", label: "Home Runs" },
    { category: "batting", stat: "walks", label: "Walks" },
    { category: "batting", stat: "runnersLeftOnBase", label: "Left on Base" },
    { category: "pitching", stat: "strikeouts", label: "Strikeouts" },
    { category: "pitching", stat: "ERA", label: "ERA" },
    { category: "fielding", stat: "errors", label: "Errors" },
  ],
  nfl: [
    { category: "passing", stat: "netPassingYards", label: "Passing Yards" },
    { category: "rushing", stat: "rushingYards", label: "Rushing Yards" },
    { category: "general", stat: "turnovers", label: "Turnovers" },
    { category: "general", stat: "totalYards", label: "Total Yards" },
  ],
  nba: [
    { category: "general", stat: "rebounds", label: "Rebounds" },
    { category: "general", stat: "assists", label: "Assists" },
    { category: "general", stat: "turnovers", label: "Turnovers" },
    { category: "general", stat: "fieldGoalPct", label: "FG%" },
  ],
  nhl: [
    { category: "general", stat: "shotsTotal", label: "Shots" },
    { category: "general", stat: "powerPlayPct", label: "Power Play %" },
    { category: "general", stat: "penaltyMinutes", label: "PIM" },
  ],
};

function parseTeamStats(
  teams: EspnBoxscoreTeam[] | undefined,
  awayAbbr: string,
  homeAbbr: string,
  league: LeagueKey,
): TeamStatRow[] {
  if (!teams || teams.length < 2) return [];

  const away = teams.find((t) => t.team?.abbreviation === awayAbbr) ?? teams[0];
  const home = teams.find((t) => t.team?.abbreviation === homeAbbr) ?? teams[1];

  function findStat(team: EspnBoxscoreTeam | undefined, category: string, stat: string) {
    return team?.statistics
      ?.find((c) => c.name === category)
      ?.stats?.find((s) => s.name === stat)?.displayValue;
  }

  const rows: TeamStatRow[] = [];
  for (const { category, stat, label } of KEY_TEAM_STATS[league] ?? []) {
    const awayVal = findStat(away, category, stat);
    const homeVal = findStat(home, category, stat);
    // Neither team has this stat — likely a wrong category/name guess for
    // this league, so skip the row instead of showing a false "—" vs "—".
    if (awayVal === undefined && homeVal === undefined) continue;
    rows.push({ label, away: awayVal ?? "—", home: homeVal ?? "—" });
  }
  return rows;
}

function pickTopPerformer(
  category: EspnBoxscorePlayerCategory,
  teamAbbr: string | null,
): GameLeader | null {
  const athletes = category.athletes ?? [];
  const labels = category.labels ?? [];
  if (athletes.length === 0) return null;

  const idx = (label: string) => labels.indexOf(label);
  const numAt = (line: EspnBoxscoreAthleteLine, i: number) =>
    i >= 0 ? Number(line.stats?.[i] ?? 0) || 0 : 0;

  if (category.type === "batting") {
    const hrIdx = idx("HR");
    const rbiIdx = idx("RBI");
    const hIdx = idx("H");
    const best = athletes.reduce((top, a) => {
      const score = numAt(a, hrIdx) * 4 + numAt(a, rbiIdx) * 2 + numAt(a, hIdx);
      const topScore = numAt(top, hrIdx) * 4 + numAt(top, rbiIdx) * 2 + numAt(top, hIdx);
      return score > topScore ? a : top;
    }, athletes[0]);

    const name = best.athlete?.displayName;
    if (!name) return null;
    const parts = [
      hIdx >= 0 && `${best.stats?.[hIdx]} H`,
      hrIdx >= 0 && numAt(best, hrIdx) > 0 && `${best.stats?.[hrIdx]} HR`,
      rbiIdx >= 0 && `${best.stats?.[rbiIdx]} RBI`,
    ].filter(Boolean);
    return { label: "Batting", playerName: name, team: teamAbbr, value: parts.join(", ") };
  }

  if (category.type === "pitching") {
    const kIdx = idx("K");
    const erIdx = idx("ER");
    const ipIdx = idx("IP");
    const best = athletes.reduce((top, a) => {
      const score = numAt(a, kIdx) - numAt(a, erIdx);
      const topScore = numAt(top, kIdx) - numAt(top, erIdx);
      return score > topScore ? a : top;
    }, athletes[0]);

    const name = best.athlete?.displayName;
    if (!name) return null;
    const parts = [
      ipIdx >= 0 && `${best.stats?.[ipIdx]} IP`,
      kIdx >= 0 && `${best.stats?.[kIdx]} K`,
      erIdx >= 0 && `${best.stats?.[erIdx]} ER`,
    ].filter(Boolean);
    return { label: "Pitching", playerName: name, team: teamAbbr, value: parts.join(", ") };
  }

  // Unrecognized category (NFL/NBA/NHL, unverified) — rather than guess
  // which column means "good," just surface the first listed athlete
  // (typically the most prominent/starter) with their full stat line.
  const first = athletes[0];
  const name = first.athlete?.displayName;
  if (!name) return null;
  const value = labels
    .map((label, i) => (first.stats?.[i] ? `${first.stats[i]} ${label}` : null))
    .filter(Boolean)
    .join(", ");
  return { label: category.type ?? "Stats", playerName: name, team: teamAbbr, value };
}

function parsePlayerTopPerformers(players: EspnBoxscorePlayerTeam[] | undefined): GameLeader[] {
  return (players ?? []).flatMap((teamBox) => {
    const teamAbbr = teamBox.team?.abbreviation ?? null;
    return (teamBox.statistics ?? [])
      .map((category) => pickTopPerformer(category, teamAbbr))
      .filter((leader): leader is GameLeader => leader !== null);
  });
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

    // The scoreboard's mirrored "leaders" field doesn't exist on this
    // endpoint for MLB (came back null) — fall back to deriving top
    // performers from the real per-player box score when it's absent.
    const rootLeaders = extractLeaders({ leaders: data.leaders }, undefined, undefined);
    const topPerformers =
      rootLeaders.length > 0 ? rootLeaders : parsePlayerTopPerformers(data.boxscore?.players);

    return {
      teamStats: parseTeamStats(data.boxscore?.teams, awayAbbr, homeAbbr, league),
      topPerformers,
    };
  } catch {
    return { teamStats: [], topPerformers: [] };
  }
}

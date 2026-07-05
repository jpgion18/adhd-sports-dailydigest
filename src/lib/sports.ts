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

export interface LeagueDigest {
  league: LeagueKey;
  label: string;
  games: Game[];
  error: string | null;
}

interface EspnCompetitor {
  homeAway: "home" | "away";
  score?: string;
  winner?: boolean;
  team?: { abbreviation?: string; displayName?: string; shortDisplayName?: string };
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
  return {
    abbreviation: competitor?.team?.abbreviation ?? "?",
    name:
      competitor?.team?.shortDisplayName ??
      competitor?.team?.displayName ??
      "Unknown",
    score: competitor?.score !== undefined ? Number(competitor.score) : null,
    winner: competitor?.winner ?? false,
  };
}

export async function fetchLeagueDigest(
  league: LeagueKey,
  sportPath: string,
  label: string,
): Promise<LeagueDigest> {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard`,
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

export async function fetchAllDigests(): Promise<LeagueDigest[]> {
  return Promise.all(
    LEAGUES.map(({ key, sportPath, label }) => fetchLeagueDigest(key, sportPath, label)),
  );
}

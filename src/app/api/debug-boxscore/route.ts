import { NextRequest, NextResponse } from "next/server";
import { LEAGUES } from "@/lib/sports";

// TEMPORARY — inspects the real shape of ESPN's summary endpoint so parsing
// in src/lib/sports.ts can be fixed against real data instead of guesses.
// Delete this route once box score parsing is confirmed correct.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const league = params.get("league");
  const eventId = params.get("eventId");

  const sportPath = LEAGUES.find((l) => l.key === league)?.sportPath;
  if (!sportPath || !eventId) {
    return NextResponse.json(
      { error: "Pass ?league=mlb&eventId=<id> (league one of nfl/nba/mlb/nhl)" },
      { status: 400 },
    );
  }

  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${eventId}`,
  );
  if (!res.ok) {
    return NextResponse.json({ error: `ESPN responded with ${res.status}` }, { status: 502 });
  }
  const data = await res.json();

  const team0 = data.boxscore?.teams?.[0];
  const team0Stat0 = team0?.statistics?.[0];

  const player0 = data.boxscore?.players?.[0];
  const player0Stat0 = player0?.statistics?.[0];

  return NextResponse.json({
    topLevelKeys: Object.keys(data),
    boxscoreKeys: data.boxscore ? Object.keys(data.boxscore) : null,
    leadersSample: data.leaders?.[0] ?? null,

    boxscoreTeamsCount: data.boxscore?.teams?.length ?? 0,
    team0Keys: team0 ? Object.keys(team0) : null,
    team0StatisticsCount: team0?.statistics?.length ?? 0,
    team0Stat0Full: team0Stat0 ?? null,
    team0AllStatKeys: team0?.statistics?.map((s: Record<string, unknown>) => Object.keys(s)) ?? null,
    team0AllStatsRaw: team0?.statistics ?? null,

    boxscorePlayersCount: data.boxscore?.players?.length ?? 0,
    player0Keys: player0 ? Object.keys(player0) : null,
    player0Stat0Full: player0Stat0 ?? null,
  });
}

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
  // Names only (not full stat descriptions) to keep this compact — we
  // already confirmed the "batting" category's full shape last round.
  const team0CategoryNames = (team0?.statistics ?? []).map(
    (cat: { name?: string; stats?: { name?: string }[] }) => ({
      category: cat.name,
      statNames: (cat.stats ?? []).map((s) => s.name),
    }),
  );

  const headerCompetition = data.header?.competitions?.[0];

  const player0 = data.boxscore?.players?.[0];
  const player0Category0 = player0?.statistics?.[0];

  return NextResponse.json({
    // Category + stat *names* for every team-stats category (batting,
    // pitching, fielding, etc.) — tells us what to pick for the comparison
    // table without re-dumping full descriptions.
    team0CategoryNames,

    // Where might per-game stat leaders live, now that root "leaders" is null?
    headerLeadersSample: headerCompetition?.leaders?.[0] ?? "NO leaders on header.competitions[0]",
    headerCompetitionKeys: headerCompetition ? Object.keys(headerCompetition) : null,

    // Per-player box score shape, for deriving top performers directly if
    // header leaders don't pan out.
    boxscorePlayersCount: data.boxscore?.players?.length ?? 0,
    player0Keys: player0 ? Object.keys(player0) : null,
    player0Category0Keys: player0Category0 ? Object.keys(player0Category0) : null,
    player0Category0LabelsAndFirstAthlete: player0Category0
      ? {
          name: player0Category0.name,
          labels: player0Category0.labels,
          firstAthlete: player0Category0.athletes?.[0] ?? null,
        }
      : null,
  });
}

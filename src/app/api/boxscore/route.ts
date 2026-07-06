import { NextRequest, NextResponse } from "next/server";
import { fetchGameBoxScore, LEAGUES, type LeagueKey } from "@/lib/sports";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const league = params.get("league");
  const eventId = params.get("eventId");
  const awayAbbr = params.get("away");
  const homeAbbr = params.get("home");

  if (
    !league ||
    !eventId ||
    !awayAbbr ||
    !homeAbbr ||
    !LEAGUES.some((l) => l.key === league)
  ) {
    return NextResponse.json(
      { error: "Missing or invalid league, eventId, away, or home" },
      { status: 400 },
    );
  }

  const result = await fetchGameBoxScore(league as LeagueKey, eventId, awayAbbr, homeAbbr);
  return NextResponse.json(result);
}

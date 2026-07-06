export interface BigThreeItem {
  team: string;
  text: string;
}

export interface WorldCupWatch {
  yesterday: string;
  today: string;
  usmnt: string;
}

export interface PodcastPrep {
  /** ISO date (YYYY-MM-DD) this episode's prep covers. Used for sorting and archive URLs. */
  date: string;
  dateLabel: string;
  bigThree: BigThreeItem[];
  worldCup: WorldCupWatch;
  weirdOne: string;
}

// Newest-first is the convention here, but callers should not rely on
// insertion order — use the exported helpers, which sort by `date`.
export const podcastPrepArchive: PodcastPrep[] = [
  {
    date: "2026-07-05",
    dateLabel: "July 5, 2026",
    bigThree: [
      {
        team: "Phillies",
        text: "Jesús Luzardo was filthy again last night, six K's and one run allowed in a 6-1 win over the Royals — his ERA has cratered from 5.77 to 3.75 over his last ten starts. Alec Bohm's leadoff bomb in the 6th did the rest, and Brandon Marsh somehow went hitless on the same night he got named an All-Star starter. They're back at Kauffman today for the series finale, Nola on the mound.",
      },
      {
        team: "Eagles",
        text: 'The A.J. Brown soap opera is still the whole offseason — Brown told NBC he and Jalen Hurts had "drifted apart" before the Patriots trade, and Hurts is publicly insisting nothing changed. Meanwhile the D got a face-lift: Jordan Davis just became the highest-paid nose tackle ever, and they traded for pass rusher Jonathan Greenard. Camp opens July 28 and every rep of new OC Sean Mannion\'s offense will get microscoped.',
      },
      {
        team: "Sixers",
        text: "They pulled off the trade of the summer — Jaylen Brown for Paul George and four picks — and the league's reaction has been \"the Sixers robbed Boston,\" with grades from A- to A+. Brown slots in next to Embiid and Maxey six years younger than George, and Philly also locked up Anfernee Simons within 24 hours of the trade.",
      },
    ],
    worldCup: {
      yesterday: "Morocco throttled Canada 3-0, and France beat Paraguay 1-0 right here at the Linc on Mbappé's penalty — Philly's World Cup run is officially over, but the city got its moment on the world stage during America's 250th birthday weekend.",
      today: "Brazil-Norway at MetLife (4pm) and Mexico-England in Mexico City (8pm) close out the Round of 16.",
      usmnt: "Beat Bosnia and Herzegovina 2-0 for their first knockout-stage win since 2002 — Belgium's up next, Round of 16, tomorrow at 8pm ET in Seattle.",
    },
    weirdOne:
      "A duck named Merlín crashed the scene outside Mexico City's stadium before Mexico-Czech Republic and became a bigger story than either goal scorer. In a World Cup full of chaos, a random duck is the undefeated champion of main-character energy.",
  },
];

function sortedByDateDesc(): PodcastPrep[] {
  return [...podcastPrepArchive].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPodcastPrepArchive(): PodcastPrep[] {
  return sortedByDateDesc();
}

export function getPodcastPrepByDate(date: string): PodcastPrep | undefined {
  return podcastPrepArchive.find((entry) => entry.date === date);
}

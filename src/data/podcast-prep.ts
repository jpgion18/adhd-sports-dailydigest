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
    date: "2026-07-09",
    dateLabel: "July 9, 2026",
    bigThree: [
      {
        team: "Phillies",
        text: "Rough one last night — Reds hit four home runs in the 4th inning alone (Sal Stewart with two of them) in an 11-5 win, and the Phillies' pitching staff allowed five homers total, tying a season high. The lone bright spot: Kyle Schwarber went deep for his MLB-leading 32nd homer, passing Mike Schmidt's 1979 total (31) for the most in franchise history before the All-Star break, with Realmuto also homering.",
      },
      {
        team: "Eagles",
        text: "Still quiet on Broad Street — the team's rolling out position-group training camp previews (interior D-line this time: Jalen Carter, Jordan Davis, and Moro Ojomo) with camp three weeks out on July 28.",
      },
      {
        team: "Sixers",
        text: "Summer League tips off today in Las Vegas — the Sixers open at 5:30pm ET against the Pistons on Prime Video, first look at No. 22 pick LaBaron Philon Jr. and second-year big man Johni Broome.",
      },
    ],
    worldCup: {
      yesterday: "Round of 16 wrapped up: Argentina survived a wild one, coming back from 2-0 down in the 79th minute to beat Egypt 3-2 (Messi scored and assisted, Enzo Fernández got the 92nd-minute winner), and Switzerland beat Colombia on penalties after a scoreless 120 minutes.",
      today: "Quarterfinals kick off — France vs. Morocco is first up today.",
      usmnt: "Done for the tournament after Monday's 4-1 Round of 16 loss to Belgium, who now face Spain in the quarters.",
    },
    weirdOne:
      "A dog walker in Buenos Aires has turned a pack of 13 pups into local celebrities by dressing them all in Argentina jerseys for the World Cup run — genuinely might be getting more street attention than some of the actual players right now.",
  },
  {
    date: "2026-07-08",
    dateLabel: "July 8, 2026",
    bigThree: [
      {
        team: "Phillies",
        text: "Bounced back from Monday's blowout loss with a 4-1 win over the Reds last night in Cincinnati. They're back at it again today to close out the series.",
      },
      {
        team: "Eagles",
        text: "Camp preview season continues — running back room coverage this time, with Saquon Barkley entrenched as the headliner, free-agent add Dameon Pierce, and Elijah Mitchell signed after an Eagles rookie-camp tryout. Report date is still July 28.",
      },
      {
        team: "Sixers",
        text: "Everything's pointed at tomorrow's Summer League opener in Las Vegas against the Pistons — the full 2026 roster is set, led by No. 22 pick LaBaron Philon Jr.",
      },
    ],
    worldCup: {
      yesterday: "Belgium eliminated the USMNT 4-1 in the Round of 16 Monday night in Seattle — Charles De Ketelaere scored twice and assisted a third, and Malik Tillman's free-kick goal was the lone U.S. answer.",
      today: "Round of 16 finishes today: Argentina-Egypt and Switzerland-Colombia close out the bracket before Thursday's quarterfinals begin.",
      usmnt: "The co-hosts' tournament is over — first Round of 16 appearance since 2002 ends the same way that one did, in the round of 16.",
    },
    weirdOne:
      "Adam Sandler reportedly officiated Taylor Swift and Travis Kelce's wedding over the weekend, then went and played in a pickup basketball game right after — living two completely different main-character lives within a few hours of each other.",
  },
  {
    date: "2026-07-07",
    dateLabel: "July 7, 2026",
    bigThree: [
      {
        team: "Phillies",
        text: "Ugly one Monday — Royals hammered them 15-1, multiple home runs in the loss. They get a chance to answer back tonight against the Reds in Cincinnati.",
      },
      {
        team: "Eagles",
        text: "Training camp preview coverage is rolling out position by position (running back and tight end so far) ahead of the July 28 report date — Dallas Goedert enters camp as the clear No. 1 tight end again, with second-round pick Eli Stowers behind him.",
      },
      {
        team: "Sixers",
        text: "Released their official 2026 Summer League roster for Las Vegas (July 9-19), headlined by No. 22 overall pick LaBaron Philon Jr. — the Alabama guard averaged 22.0 points and 5.0 assists as a sophomore. Tip-off against the Pistons is Thursday.",
      },
    ],
    worldCup: {
      yesterday: "Belgium ended the USMNT's tournament with a 4-1 Round of 16 win in Seattle — Charles De Ketelaere had two goals and an assist, with Malik Tillman's free kick the lone U.S. goal.",
      today: "Round of 16 continues — Argentina and Switzerland are both in action this week before the bracket moves to quarterfinals on Thursday.",
      usmnt: "Tournament's over — Belgium moves on to face Spain in the quarterfinals.",
    },
    weirdOne:
      "Adam Sandler reportedly officiated Taylor Swift and Travis Kelce's Madison Square Garden wedding last weekend, then hopped straight into a pickup basketball game afterward.",
  },
  {
    date: "2026-07-06",
    dateLabel: "July 6, 2026",
    bigThree: [
      {
        team: "Phillies",
        text: "Luzardo was even better than the final line — nine strikeouts and he retired the first eight Royals he faced in the 6-1 win, with Realmuto and Gabriel Rincones Jr. hitting back-to-back homers to make it 3-0 and Schwarber chipping in three singles. The series continues today in Kansas City, and Philly heads into the All-Star break with five representatives, including first-timer Brandon Marsh.",
      },
      {
        team: "Eagles",
        text: "It's a quiet news day on Broad Street with camp still three weeks out (July 28), so the coverage is turning to position-group previews — interior O-line questions around Cam Jurgens and Landon Dickerson are getting the early ink. The A.J. Brown-to-Patriots fallout is still simmering in the background heading into camp.",
      },
      {
        team: "Sixers",
        text: "Free agency's negotiating moratorium lifted at 12:01pm today and deals started becoming official: Dean Wade signed a 4-year, $39M deal (new president Mike Gansey's first signing) and Ariel Hukporti got a 1-year, $3.4M deal. Kelly Oubre Jr. is officially gone to Indiana and Quentin Grimes to the Lakers, while Anfernee Simons' deal from last week is now locked in alongside the Jaylen Brown trade.",
      },
    ],
    worldCup: {
      yesterday: "Norway shocked Brazil 2-1 at MetLife Stadium and England beat Mexico 3-2 in Mexico City, closing out the Round of 16 field alongside Monday's card.",
      today: "USA-Belgium is the lone match today, Round of 16 at Lumen Field in Seattle, 8pm ET.",
      usmnt: "Win and they're in the quarterfinals against the Spain/Portugal winner; lose and the co-hosts' tournament ends before the final eight — first knockout-round elimination game for the U.S. since 2002.",
    },
    weirdOne:
      "Taylor Swift and Travis Kelce got married at Madison Square Garden on July 4th, with Wayne Gretzky and Selena Gomez among the guests. An NFL tight end getting married at the world's most famous arena in the middle of World Cup week is exactly the kind of chaos 2026 has been serving up.",
  },
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

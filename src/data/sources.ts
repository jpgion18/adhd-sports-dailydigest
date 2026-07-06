export interface SourceAccount {
  name: string;
  handle: string;
  outlet: string;
  blurb: string;
}

export interface SourceGroup {
  title: string;
  accounts: SourceAccount[];
}

export const sourceGroups: SourceGroup[] = [
  {
    title: "League Insiders",
    accounts: [
      {
        name: "Adam Schefter",
        handle: "AdamSchefter",
        outlet: "ESPN, NFL",
        blurb: "First word on trades, signings, and injury news league-wide.",
      },
      {
        name: "Ian Rapoport",
        handle: "RapSheet",
        outlet: "NFL Network / ESPN, NFL",
        blurb: "Often paired with Schefter on the biggest breaking NFL news.",
      },
      {
        name: "Shams Charania",
        handle: "ShamsCharania",
        outlet: "ESPN, NBA",
        blurb: "The go-to source for NBA trades and free agency.",
      },
      {
        name: "Chris Haynes",
        handle: "ChrisBHaynes",
        outlet: "NBA on Prime",
        blurb: "Second-source confirmation and deeper reporting on NBA moves.",
      },
      {
        name: "Jeff Passan",
        handle: "JeffPassan",
        outlet: "ESPN, MLB",
        blurb: "Breaking MLB trades, signings, and injury news.",
      },
      {
        name: "Ken Rosenthal",
        handle: "Ken_Rosenthal",
        outlet: "The Athletic / Fox Sports",
        blurb: "Veteran MLB insider, especially strong at the trade deadline.",
      },
      {
        name: "Jon Heyman",
        handle: "JonHeyman",
        outlet: "New York Post",
        blurb: "Longtime MLB insider with deep front-office sourcing.",
      },
    ],
  },
  {
    title: "Eagles Beat",
    accounts: [
      {
        name: "Jeff McLane",
        handle: "Jeff_McLane",
        outlet: "Philadelphia Inquirer",
        blurb: "Lead Eagles beat writer, day-to-day team coverage.",
      },
      {
        name: "Zach Berman",
        handle: "zberm",
        outlet: "PHLY Sports",
        blurb: "Co-host of the PHLY Eagles podcast, deep roster and scheme analysis.",
      },
      {
        name: "Bo Wulf",
        handle: "Bo_Wulf",
        outlet: "PHLY Sports",
        blurb: "Eagles beat, strong on locker room and strategy.",
      },
    ],
  },
  {
    title: "Phillies Beat",
    accounts: [
      {
        name: "Matt Gelb",
        handle: "MattGelb",
        outlet: "The Athletic",
        blurb: "Lead Phillies beat writer for The Athletic.",
      },
      {
        name: "Scott Lauber",
        handle: "ScottLauber",
        outlet: "Philadelphia Inquirer",
        blurb: "Phillies/MLB reporter, trade deadline and roster moves.",
      },
      {
        name: "Lochlahn March",
        handle: "lochlahn",
        outlet: "Philadelphia Inquirer",
        blurb: "Phillies beat writer, daily lineups and game coverage.",
      },
    ],
  },
  {
    title: "Sixers Beat",
    accounts: [
      {
        name: "Kyle Neubeck",
        handle: "KyleNeubeck",
        outlet: "PhillyVoice",
        blurb: "Sixers beat, sharp analysis and breaking roster news.",
      },
      {
        name: "Adam Aaronson",
        handle: "SixersAdam",
        outlet: "PhillyVoice",
        blurb: "Sixers beat writer, free agency and trade coverage.",
      },
      {
        name: "Derek Bodner",
        handle: "DerekBodnerNBA",
        outlet: "PHLY Sports",
        blurb: "Longtime Sixers analyst, film and strategy focus.",
      },
    ],
  },
];

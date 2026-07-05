import Link from "next/link";
import { podcastPrep } from "@/data/podcast-prep";

export const metadata = {
  title: "Podcast Prep — ADHD Sports Daily",
};

export default function PodcastPrepPage() {
  const { dateLabel, bigThree, hotTakes, champChump, startBenchCut, worldCup, weirdOne } =
    podcastPrep;

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
        <header>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            ← Scores
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Podcast Prep
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">{dateLabel}</p>
        </header>

        <Section title="The Big 3">
          <div className="flex flex-col gap-4">
            {bigThree.map((item) => (
              <div key={item.team}>
                <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
                  {item.team}
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">{item.text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Hot Take Fuel">
          <ul className="flex flex-col gap-4">
            {hotTakes.map((take, i) => (
              <li
                key={i}
                className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              >
                {take}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Champ & Chump">
          <div className="flex flex-col gap-3">
            <p>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Champ:{" "}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">{champChump.champ}</span>
            </p>
            <p>
              <span className="font-semibold text-red-600 dark:text-red-400">
                Chump:{" "}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">{champChump.chump}</span>
            </p>
          </div>
        </Section>

        <Section title={`Start, Bench, Cut — ${startBenchCut.theme}`}>
          <div className="flex flex-col gap-3">
            <p>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Start:{" "}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">{startBenchCut.start}</span>
            </p>
            <p>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                Bench:{" "}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">{startBenchCut.bench}</span>
            </p>
            <p>
              <span className="font-semibold text-red-600 dark:text-red-400">Cut: </span>
              <span className="text-zinc-700 dark:text-zinc-300">{startBenchCut.cut}</span>
            </p>
          </div>
        </Section>

        <Section title="World Cup Watch">
          <div className="flex flex-col gap-3">
            <p>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                Yesterday:{" "}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">{worldCup.yesterday}</span>
            </p>
            <p>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                Today:{" "}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">{worldCup.today}</span>
            </p>
            <p>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                USMNT:{" "}
              </span>
              <span className="text-zinc-700 dark:text-zinc-300">{worldCup.usmnt}</span>
            </p>
          </div>
        </Section>

        <Section title="The Weird One">
          <p className="text-zinc-700 dark:text-zinc-300">{weirdOne}</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      {children}
    </section>
  );
}

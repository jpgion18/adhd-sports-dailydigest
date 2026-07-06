import Link from "next/link";
import { notFound } from "next/navigation";
import { PodcastPrepView } from "@/components/PodcastPrepView";
import { getLatestPodcastPrep, getPodcastPrepArchive } from "@/data/podcast-prep";

export const metadata = {
  title: "Podcast Prep — ADHD Sports Daily",
};

export default function PodcastPrepPage() {
  const latest = getLatestPodcastPrep();
  if (!latest) notFound();

  const pastEpisodes = getPodcastPrepArchive().filter((entry) => entry.date !== latest.date);

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
          <p className="text-zinc-500 dark:text-zinc-400">{latest.dateLabel}</p>
        </header>

        <PodcastPrepView data={latest} />

        {pastEpisodes.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Past Episodes
            </h2>
            <ul className="flex flex-col gap-2">
              {pastEpisodes.map((entry) => (
                <li key={entry.date}>
                  <Link
                    href={`/podcast-prep/${entry.date}`}
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {entry.dateLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

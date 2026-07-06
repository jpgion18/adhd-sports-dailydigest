import Link from "next/link";
import { notFound } from "next/navigation";
import { Digest } from "@/components/Digest";
import { PodcastPrepView } from "@/components/PodcastPrepView";
import { getPodcastPrepArchive, getPodcastPrepByDate } from "@/data/podcast-prep";
import { fetchAllDigests, todayISODate } from "@/lib/sports";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function addDays(isoDate: string, delta: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

function formatDateLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  return { title: DATE_RE.test(date) ? `${formatDateLabel(date)} — ADHD Sports Daily` : "ADHD Sports Daily" };
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!DATE_RE.test(date)) notFound();

  const today = todayISODate();
  const [digests, podcastPrep] = await Promise.all([
    fetchAllDigests(date),
    Promise.resolve(getPodcastPrepByDate(date)),
  ]);

  const prevDate = addDays(date, -1);
  const nextDate = addDays(date, 1);
  const hasNext = date < today;
  const otherEpisodes = getPodcastPrepArchive().filter((entry) => entry.date !== date);

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
        <header className="flex items-center justify-between gap-4">
          <Link
            href={`/day/${prevDate}`}
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Prev Day
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {formatDateLabel(date)}
            </h1>
            {date === today && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Today</p>
            )}
          </div>
          {hasNext ? (
            <Link
              href={`/day/${nextDate}`}
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Next Day →
            </Link>
          ) : (
            <span className="text-sm text-zinc-300 dark:text-zinc-700">Next Day →</span>
          )}
        </header>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Scores
          </h2>
          <Digest digests={digests} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Podcast Prep
          </h2>
          {podcastPrep ? (
            <PodcastPrepView data={podcastPrep} />
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {date === today
                ? "Today's prep hasn't been generated yet — check back after 7am ET."
                : "No podcast prep was saved for this day."}
            </p>
          )}
        </section>

        {otherEpisodes.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Jump to a Day
            </h2>
            <ul className="flex flex-col gap-2">
              {otherEpisodes.map((entry) => (
                <li key={entry.date}>
                  <Link
                    href={`/day/${entry.date}`}
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

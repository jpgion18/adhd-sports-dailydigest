import Link from "next/link";
import { notFound } from "next/navigation";
import { PodcastPrepView } from "@/components/PodcastPrepView";
import { getPodcastPrepArchive, getPodcastPrepByDate } from "@/data/podcast-prep";

export function generateStaticParams() {
  return getPodcastPrepArchive().map((entry) => ({ date: entry.date }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const entry = getPodcastPrepByDate(date);
  return { title: entry ? `${entry.dateLabel} — Podcast Prep` : "Podcast Prep" };
}

export default async function PodcastPrepArchivePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const entry = getPodcastPrepByDate(date);
  if (!entry) notFound();

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
        <header>
          <Link
            href="/podcast-prep"
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            ← Podcast Prep
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Podcast Prep
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">{entry.dateLabel}</p>
        </header>

        <PodcastPrepView data={entry} />
      </div>
    </div>
  );
}

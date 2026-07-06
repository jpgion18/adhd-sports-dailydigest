import Link from "next/link";
import { SourceCard } from "@/components/SourceCard";
import { sourceGroups } from "@/data/sources";

export const metadata = {
  title: "Sources — ADHD Sports Daily",
};

export default function SourcesPage() {
  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
        <header>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            ← Today
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Sources
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            League insiders and Philly beat writers to follow on X for breaking news.
          </p>
        </header>

        {sourceGroups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {group.title}
            </h2>
            <ul className="flex flex-col gap-3">
              {group.accounts.map((account) => (
                <SourceCard key={account.handle} {...account} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

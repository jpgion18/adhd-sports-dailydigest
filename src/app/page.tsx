import { Digest } from "@/components/Digest";
import { fetchAllDigests } from "@/lib/sports";

export default async function Home() {
  const digests = await fetchAllDigests();
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <Digest digests={digests} dateLabel={dateLabel} />
    </div>
  );
}

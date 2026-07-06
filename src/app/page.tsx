import { redirect } from "next/navigation";
import { todayISODate } from "@/lib/sports";

export default function Home() {
  redirect(`/day/${todayISODate()}`);
}

import Link from "next/link";
import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
  await requireSession();
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link
          href="/notes/new"
          className="rounded-md bg-foreground px-3 py-2 font-medium text-background"
        >
          New Note
        </Link>
      </div>
    </main>
  );
}

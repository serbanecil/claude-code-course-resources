import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
  await requireSession();
  return <main>Dashboard</main>;
}

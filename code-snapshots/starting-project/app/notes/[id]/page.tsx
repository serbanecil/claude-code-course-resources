import { requireSession } from "@/lib/session";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  return <main>Note editor: {id}</main>;
}

import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { getSession } from "@/lib/session";

export async function Header() {
  const session = await getSession();

  return (
    <header className="border-b border-foreground/10">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          NextNotes
        </Link>
        {session && <LogoutButton />}
      </div>
    </header>
  );
}

import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-foreground/10">
      <div className="mx-auto flex w-full max-w-3xl items-center px-4 py-3">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          NextNotes
        </Link>
      </div>
    </header>
  );
}

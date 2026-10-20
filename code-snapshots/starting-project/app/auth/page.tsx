import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/session";

const modeSchema = z.enum(["signin", "signup"]).catch("signin");

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  if (await getSession()) redirect("/dashboard");

  const mode = modeSchema.parse((await searchParams).mode);
  const isSignUp = mode === "signup";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">
        {isSignUp ? "Create your account" : "Sign in"}
      </h1>
      <AuthForm key={mode} mode={mode} />
      <p className="text-sm">
        {isSignUp ? "Already have an account? " : "No account yet? "}
        <Link
          href={isSignUp ? "/auth?mode=signin" : "/auth?mode=signup"}
          className="font-medium underline"
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </main>
  );
}

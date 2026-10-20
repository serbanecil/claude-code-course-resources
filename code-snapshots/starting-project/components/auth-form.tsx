"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export type AuthMode = "signin" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isSignUp = mode === "signup";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    const name = String(data.get("name") ?? "");

    setError(null);
    startTransition(async () => {
      const { error } = isSignUp
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });

      if (error) {
        setError(error.message ?? "Something went wrong. Please try again.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isSignUp && (
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="rounded-md border border-foreground/20 bg-transparent px-3 py-2"
          />
        </div>
      )}
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-foreground/20 bg-transparent px-3 py-2"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          className="rounded-md border border-foreground/20 bg-transparent px-3 py-2"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-foreground px-3 py-2 font-medium text-background disabled:opacity-50"
      >
        {isPending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}

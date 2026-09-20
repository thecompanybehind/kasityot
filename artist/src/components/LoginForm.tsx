"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Field, fieldClass } from "@/components/ui";
import { signIn } from "@/lib/actions";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await signIn(formData);
      if (!res.ok) setError(res.error ?? "Could not sign in.");
      else {
        router.push(next);
        router.refresh();
      }
    });
  }

  return (
    <form action={submit} className="grid gap-6">
      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={fieldClass}
        />
      </Field>

      {error ? (
        <p role="alert" className="m-0 text-body-sm text-brass">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer border border-brass bg-brass px-[26px] py-[14px] font-mono text-label tracking-label text-ink uppercase transition-colors disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

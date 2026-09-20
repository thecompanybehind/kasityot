"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Field, fieldClass } from "@/components/ui";
import { acceptInvite } from "@/lib/actions";

/**
 * Sets the password behind an invite link.
 *
 * The token comes from the URL and is passed straight back to the action,
 * which re-checks it: the page having rendered is not treated as proof that
 * the invite is still good.
 */
export function InviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await acceptInvite(token, formData);
      if (!res.ok) setError(res.error ?? "Could not set your password.");
      else {
        router.push("/studio");
        router.refresh();
      }
    });
  }

  return (
    <form action={submit} className="grid gap-6">
      <Field
        label="Choose a password"
        htmlFor="password"
        hint="At least 10 characters. A short phrase you will remember is better than something complicated you will not."
      >
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className={fieldClass}
        />
      </Field>

      <Field label="Type it again" htmlFor="confirm">
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
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
        {pending ? "Setting up…" : "Set password and continue"}
      </button>
    </form>
  );
}

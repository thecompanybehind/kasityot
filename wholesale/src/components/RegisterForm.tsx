"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Field, fieldClass } from "@/components/ui";
import { register } from "@/lib/actions";

/**
 * Trade registration. The account opens pending, and signs them straight in.
 *
 * Submitted through onSubmit rather than a form action: React resets a form
 * after its action returns, even when the server refused it, and a long
 * registration wiped by one mistyped GSTIN is lost to the business.
 */
export function RegisterForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      const res = await register(formData);
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else {
        router.push("/catalogue");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-[680px] gap-7">
      <Field label="Business name" htmlFor="businessName">
        <input
          id="businessName"
          name="businessName"
          required
          autoComplete="organization"
          className={fieldClass}
        />
      </Field>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Your name" htmlFor="contactName">
          <input
            id="contactName"
            name="contactName"
            required
            autoComplete="name"
            className={fieldClass}
          />
        </Field>
        <Field label="City" htmlFor="city">
          <input
            id="city"
            name="city"
            required
            autoComplete="address-level2"
            className={fieldClass}
          />
        </Field>
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" hint="You sign in with this.">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className={fieldClass}
          />
        </Field>
      </div>

      <Field
        label="GSTIN"
        htmlFor="gstin"
        hint="Optional, but it helps us approve you sooner."
      >
        <input
          id="gstin"
          name="gstin"
          maxLength={15}
          className={`${fieldClass} uppercase`}
        />
      </Field>

      <Field
        label="About your business"
        htmlFor="about"
        hint="Optional. What you sell, where, and what you are looking for from us."
      >
        <textarea
          id="about"
          name="about"
          rows={4}
          className={`${fieldClass} resize-y leading-[1.7]`}
        />
      </Field>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Password" htmlFor="password" hint="At least 10 characters.">
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
        <Field label="Password again" htmlFor="confirm">
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            className={fieldClass}
          />
        </Field>
      </div>

      {error ? (
        <p role="alert" className="m-0 text-body-sm text-brass">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-5 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer border border-brass bg-brass px-[26px] py-[14px] font-mono text-label tracking-label text-ink uppercase transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Registering…" : "Register"}
        </button>
        <span className="font-mono text-label-sm tracking-rail text-slate uppercase">
          Every account is checked by hand
        </span>
      </div>
    </form>
  );
}

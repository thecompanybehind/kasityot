"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CONTACT_DEFAULTS, type ContactInfo } from "@kasityot/core/contact";
import { Field, fieldClass } from "@/components/ui";
import { saveContactSettings } from "@/lib/actions";

const D = CONTACT_DEFAULTS;

/**
 * The contact page's details. Each box shows the current default as a
 * placeholder, so a blank box visibly means "keep what is there".
 */
export function ContactForm({ content }: { content: ContactInfo }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // onSubmit, not a form action: React resets a form after its action
  // returns, which on a refused save would throw away what was typed.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await saveContactSettings(formData);
      if (!res.ok) setError(res.error ?? "Could not save.");
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-[640px] flex-col gap-7">
      <Field
        label="Phone / WhatsApp"
        htmlFor="phone"
        hint="Write it as visitors should read it, e.g. +91 99200 22433. Tapping it on a phone dials it."
      >
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={content.phone}
          placeholder={D.phone}
          className={fieldClass}
        />
      </Field>

      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={content.email}
          placeholder={D.email}
          className={fieldClass}
        />
      </Field>

      <Field
        label="Studio address"
        htmlFor="address"
        hint="Shown in the Studio box. Each line here is a line on the page."
      >
        <textarea
          id="address"
          name="address"
          rows={4}
          defaultValue={content.address}
          placeholder={D.address}
          className={`${fieldClass} resize-y leading-[1.7]`}
        />
      </Field>

      {error ? (
        <div
          role="alert"
          className="border border-brass/45 px-4 py-3 text-body-sm text-brass"
        >
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer border-none bg-brass px-[34px] py-[17px] font-mono text-label tracking-label text-ink uppercase transition-colors hover:bg-cream disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save contact details"}
        </button>
        {saved ? (
          <span
            role="status"
            className="font-mono text-label-sm tracking-rail text-brass uppercase"
          >
            Saved — live on the site within a minute
          </span>
        ) : null}
      </div>
    </form>
  );
}

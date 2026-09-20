"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageField } from "@/components/ImageField";
import { Field, fieldClass, labelClass } from "@/components/ui";
import { submitApplication } from "@/lib/actions";

/**
 * The public application form.
 *
 * Written for a craftsperson who may never have filled in a form like this,
 * so the labels ask plain questions and the one long field says why it
 * matters rather than just demanding 120 characters.
 */
export function JoinForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string>("");
  const [story, setStory] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set("photo", photo);

    setError(null);
    start(async () => {
      const res = await submitApplication(form);
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else router.push("/join/thanks");
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-[680px] gap-7">
      <Field label="Your name" htmlFor="name">
        <input id="name" name="name" required className={fieldClass} />
      </Field>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" hint="We reply here.">
          <input
            id="email"
            name="email"
            type="email"
            required
            className={fieldClass}
          />
        </Field>
        <Field label="Phone" htmlFor="phone" hint="Optional.">
          <input id="phone" name="phone" className={fieldClass} />
        </Field>
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field
          label="Your craft"
          htmlFor="craftType"
          hint="e.g. Pashmina weaving, Gond painting."
        >
          <input
            id="craftType"
            name="craftType"
            required
            className={fieldClass}
          />
        </Field>
        <Field
          label="Where you work"
          htmlFor="region"
          hint="Town or district, and state."
        >
          <input id="region" name="region" required className={fieldClass} />
        </Field>
      </div>

      <Field
        label="Your story"
        htmlFor="story"
        hint="How you learned the craft, who taught you, what you make. This is what we read first — a few honest sentences are worth more than a polished paragraph."
      >
        <textarea
          id="story"
          name="story"
          required
          rows={9}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className={`${fieldClass} resize-y leading-[1.7]`}
        />
        <span className="block pt-2 font-mono text-label-sm tracking-rail text-slate-dim">
          {story.trim().length < 120
            ? `${120 - story.trim().length} more characters`
            : "Long enough"}
        </span>
      </Field>

      <div>
        <span className={labelClass}>A photograph of you</span>
        <p className="m-0 pb-3 text-body-sm leading-[1.6] text-slate">
          Optional, and you can add one later. At work is better than posed.
        </p>
        <ImageField value={photo} onChange={setPhoto} />
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
          {pending ? "Sending…" : "Send application"}
        </button>
        <span className="font-mono text-label-sm tracking-rail text-slate uppercase">
          We read every one
        </span>
      </div>
    </form>
  );
}

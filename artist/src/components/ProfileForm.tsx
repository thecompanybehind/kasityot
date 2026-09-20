"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageField } from "@/components/ImageField";
import { Field, fieldClass, labelClass } from "@/components/ui";
import { saveProfile } from "@/lib/actions";
import type { StudioArtist } from "@/lib/queries";

/**
 * The artist's own profile.
 *
 * Craft and region are shown but not editable: they drive the public site's
 * filters and the owner curates them, so changing one is a conversation
 * rather than a form field.
 */
export function ProfileForm({ artist }: { artist: StudioArtist }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [photo, setPhoto] = useState(artist.photo ?? "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set("photo", photo);

    setError(null);
    setSaved(false);
    start(async () => {
      const res = await saveProfile(form);
      if (!res.ok) setError(res.error ?? "Could not save.");
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-[680px] gap-7">
      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <span className={labelClass}>Your craft</span>
          <p className="m-0 pt-1 text-body text-bone">{artist.craftType}</p>
        </div>
        <div>
          <span className={labelClass}>Where you work</span>
          <p className="m-0 pt-1 text-body text-bone">{artist.region}</p>
        </div>
      </div>
      <p className="m-0 -mt-3 text-body-sm text-slate">
        To change either of these, write to us and we will sort it out.
      </p>

      <Field label="Phone" htmlFor="phone" hint="Optional.">
        <input
          id="phone"
          name="phone"
          defaultValue={artist.phone ?? ""}
          className={fieldClass}
        />
      </Field>

      <Field
        label="Your story"
        htmlFor="story"
        hint="This appears on your page on the site, under your name."
      >
        <textarea
          id="story"
          name="story"
          required
          rows={10}
          defaultValue={artist.story}
          className={`${fieldClass} resize-y leading-[1.7]`}
        />
      </Field>

      <div>
        <span className={labelClass}>Your photograph</span>
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
          {pending ? "Saving…" : "Save"}
        </button>
        {saved ? (
          <span className="font-mono text-label-sm tracking-rail text-brass uppercase">
            Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}

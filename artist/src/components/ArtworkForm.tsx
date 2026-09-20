"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageManager } from "@/components/ImageManager";
import { Field, fieldClass, labelClass } from "@/components/ui";
import { saveArtwork } from "@/lib/actions";
import type { StudioArtwork } from "@/lib/queries";

/**
 * Add or edit one piece.
 *
 * Two submit buttons rather than a status dropdown: "save as draft" and "send
 * to Kasityot" are the only two things an artist wants to do, and naming them
 * is clearer than asking them to pick a state and then press save.
 *
 * When the piece is already live, saving takes it off the public site until
 * it is approved again. That is stated plainly above the buttons — otherwise
 * an artist fixing a typo would unpublish their own work without realising.
 */
export function ArtworkForm({ artwork }: { artwork: StudioArtwork | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [priceOnRequest, setPriceOnRequest] = useState(
    artwork?.priceOnRequest ?? false,
  );

  const isLive = artwork?.reviewStatus === "approved";

  function submit(intent: "draft" | "submit", formEl: HTMLFormElement) {
    const formData = new FormData(formEl);
    setError(null);
    start(async () => {
      const res = await saveArtwork(artwork?.id ?? null, intent, formData);
      if (!res.ok) setError(res.error ?? "Could not save.");
      else {
        router.push("/studio/artworks");
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="grid max-w-[680px] gap-7"
    >
      <Field label="Title" htmlFor="title">
        <input
          id="title"
          name="title"
          required
          defaultValue={artwork?.title ?? ""}
          className={fieldClass}
        />
      </Field>

      <Field
        label="Description"
        htmlFor="description"
        hint="What it is, how it was made, how long it took. Buyers read this closely."
      >
        <textarea
          id="description"
          name="description"
          rows={7}
          defaultValue={artwork?.description ?? ""}
          className={`${fieldClass} resize-y leading-[1.7]`}
        />
      </Field>

      <div className="grid gap-7 sm:grid-cols-2">
        <Field
          label="Material"
          htmlFor="material"
          hint="e.g. Pashmina wool, natural dyes."
        >
          <input
            id="material"
            name="material"
            defaultValue={artwork?.material ?? ""}
            className={fieldClass}
          />
        </Field>
        <Field
          label="Size"
          htmlFor="dimensions"
          hint="e.g. 90 x 200 cm, or 24 cm tall."
        >
          <input
            id="dimensions"
            name="dimensions"
            defaultValue={artwork?.dimensions ?? ""}
            className={fieldClass}
          />
        </Field>
      </div>

      <div>
        <Field
          label="Price you would like"
          htmlFor="price"
          hint="In rupees. We may suggest a different figure and will talk to you before anything is listed."
        >
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            disabled={priceOnRequest}
            defaultValue={
              artwork?.proposedPrice != null
                ? String(Math.round(artwork.proposedPrice / 100))
                : artwork?.price != null
                  ? String(Math.round(artwork.price / 100))
                  : ""
            }
            className={`${fieldClass} disabled:opacity-40`}
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-3 pt-4">
          <input
            type="checkbox"
            name="priceOnRequest"
            checked={priceOnRequest}
            onChange={(e) => setPriceOnRequest(e.target.checked)}
            className="size-4 accent-brass"
          />
          <span className="font-mono text-label-sm tracking-rail text-bone-muted uppercase">
            Ask me for a price
          </span>
        </label>
      </div>

      <div>
        <span className={labelClass}>Photographs</span>
        <p className="m-0 pb-3 text-body-sm leading-[1.6] text-slate">
          Daylight, plain background, and the piece filling most of the frame.
          The first photograph is the one buyers see first — drag it to the
          front if it is not already.
        </p>
        <ImageManager initial={artwork?.images ?? []} />
      </div>

      {error ? (
        <p role="alert" className="m-0 text-body-sm text-brass">
          {error}
        </p>
      ) : null}

      {isLive ? (
        <p className="m-0 border border-brass/40 bg-brass/5 px-4 py-3 text-body-sm leading-[1.6] text-bone-muted">
          This piece is on the site now. Saving any change takes it off until
          we have looked at it again — usually a day or two.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="button"
          disabled={pending}
          onClick={(e) => submit("submit", e.currentTarget.form!)}
          className="cursor-pointer border border-brass bg-brass px-[26px] py-[14px] font-mono text-label tracking-label text-ink uppercase transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Saving…" : isLive ? "Save and resubmit" : "Send to Kasityot"}
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={(e) => submit("draft", e.currentTarget.form!)}
          className="cursor-pointer border border-bone/25 px-[26px] py-[14px] font-mono text-label tracking-label text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass disabled:cursor-wait"
        >
          Save as draft
        </button>
      </div>
    </form>
  );
}

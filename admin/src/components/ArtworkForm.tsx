"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ImageManager } from "@/components/ImageManager";
import { Field, fieldClass } from "@/components/ui";
import { saveArtwork } from "@/lib/actions";
import type { ArtworkView } from "@/lib/queries";

export function ArtworkForm({
  artwork,
  artists,
}: {
  artwork: ArtworkView | null;
  artists: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Controls whether the price input is disabled, so the two can never
  // disagree on screen.
  const [onRequest, setOnRequest] = useState(artwork?.priceOnRequest ?? false);

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await saveArtwork(artwork?.id ?? null, formData);
      if (!res.ok) setError(res.error ?? "Could not save.");
      else {
        router.push("/artworks");
        router.refresh();
      }
    });
  }

  return (
    <form action={submit} className="flex max-w-[860px] flex-col gap-7">
      {error ? (
        <div
          role="alert"
          className="border border-brass/45 px-4 py-3 text-body-sm text-brass"
        >
          {error}
        </div>
      ) : null}

      <Field label="Title" htmlFor="title">
        <input
          id="title"
          name="title"
          required
          defaultValue={artwork?.title}
          className={fieldClass}
        />
      </Field>

      <Field label="Artist" htmlFor="artistId">
        <select
          id="artistId"
          name="artistId"
          required
          defaultValue={artwork?.artistId ?? ""}
          className={fieldClass}
        >
          <option value="" disabled>
            Choose an artist
          </option>
          {artists.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Description" htmlFor="description">
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={artwork?.description}
          className={`${fieldClass} resize-y`}
        />
      </Field>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Field label="Material" htmlFor="material">
          <input
            id="material"
            name="material"
            required
            defaultValue={artwork?.material}
            placeholder="e.g. Natural pigment on handmade paper"
            className={fieldClass}
          />
        </Field>
        <Field label="Dimensions" htmlFor="dimensions">
          <input
            id="dimensions"
            name="dimensions"
            required
            defaultValue={artwork?.dimensions}
            placeholder="e.g. 56 × 76 cm"
            className={fieldClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Field
          label="Price (₹)"
          htmlFor="price"
          hint="Whole rupees. Leave blank if the price is on request."
        >
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={1}
            disabled={onRequest}
            defaultValue={artwork?.price ? artwork.price / 100 : ""}
            className={`${fieldClass} disabled:opacity-40`}
          />
        </Field>
        <div className="flex items-end pb-3">
          <label className="flex cursor-pointer items-center gap-3 font-mono text-label tracking-rail text-bone uppercase">
            <input
              type="checkbox"
              name="priceOnRequest"
              checked={onRequest}
              onChange={(e) => setOnRequest(e.target.checked)}
              className="size-4 accent-[var(--color-brass)]"
            />
            Price on request
          </label>
        </div>
      </div>

      <ImageManager initial={artwork?.images ?? []} />

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Field
          label="Status"
          htmlFor="status"
          hint="Marking sold immediately stops new purchases and enquiries on the public site."
        >
          <select
            id="status"
            name="status"
            defaultValue={artwork?.status ?? "available"}
            className={fieldClass}
          >
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="hidden">Hidden</option>
          </select>
        </Field>
        <div className="flex items-end pb-3">
          <label className="flex cursor-pointer items-center gap-3 font-mono text-label tracking-rail text-bone uppercase">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={artwork?.featured}
              className="size-4 accent-[var(--color-brass)]"
            />
            Feature on the home page
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer border-none bg-brass px-[34px] py-[17px] font-mono text-label tracking-label text-ink uppercase transition-colors hover:bg-cream disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Saving…" : artwork ? "Save changes" : "Add artwork"}
        </button>
        <Link
          href="/artworks"
          className="font-mono text-label tracking-nav text-slate uppercase transition-colors hover:text-bone"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

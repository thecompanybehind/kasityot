"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Field, fieldClass } from "@/components/ui";
import { saveArtist } from "@/lib/actions";
import type { ArtistView } from "@/lib/queries";

export function ArtistForm({ artist }: { artist: ArtistView | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState(artist?.photo ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadPhoto(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", files[0]);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setPhoto(json.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function submit(formData: FormData) {
    setError(null);
    start(async () => {
      const res = await saveArtist(artist?.id ?? null, formData);
      if (!res.ok) setError(res.error ?? "Could not save.");
      else {
        router.push("/artists");
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

      <Field label="Name" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          defaultValue={artist?.name}
          className={fieldClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Field label="Craft" htmlFor="craftType">
          <input
            id="craftType"
            name="craftType"
            required
            defaultValue={artist?.craftType}
            placeholder="e.g. Madhubani Painting"
            className={fieldClass}
          />
        </Field>
        <Field label="Region" htmlFor="region">
          <input
            id="region"
            name="region"
            required
            defaultValue={artist?.region}
            placeholder="e.g. Madhubani, Bihar"
            className={fieldClass}
          />
        </Field>
      </div>

      <Field
        label="Story"
        htmlFor="story"
        hint="A few sentences in their own terms — this is the main text on their profile."
      >
        <textarea
          id="story"
          name="story"
          required
          rows={7}
          defaultValue={artist?.story}
          className={`${fieldClass} resize-y`}
        />
      </Field>

      {/* Photo: optional, and an empty value is stored as null so the public
          profile omits the frame entirely rather than rendering a gap. */}
      <div className="min-w-0">
        <span className="block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase">
          Photograph
        </span>
        <input type="hidden" name="photo" value={photo} />
        <div className="flex flex-wrap items-start gap-5">
          {photo ? (
            <div className="relative size-[120px] shrink-0 overflow-hidden border border-bone/15 bg-ink-raised">
              <Image src={photo} alt="" fill sizes="120px" className="object-cover" />
            </div>
          ) : null}
          <div className="min-w-0 flex-1 basis-[240px]">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => uploadPhoto(e.target.files)}
              className="block w-full text-body-sm text-bone-muted file:mr-4 file:cursor-pointer file:border file:border-brass/45 file:bg-transparent file:px-4 file:py-2 file:font-mono file:text-label-sm file:tracking-rail file:text-brass file:uppercase hover:file:border-brass"
            />
            {uploading ? (
              <p className="m-0 pt-2 font-mono text-label-sm tracking-rail text-brass uppercase">
                Uploading…
              </p>
            ) : null}
            {photo ? (
              <button
                type="button"
                onClick={() => setPhoto("")}
                className="mt-3 cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
              >
                Remove photo
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <Field
        label="Video URL"
        htmlFor="videoUrl"
        hint="Optional. A YouTube embed link, or the artist's own upload once you approve it under Submissions. Left blank, the profile shows no video section at all — no empty space."
      >
        <input
          id="videoUrl"
          name="videoUrl"
          type="url"
          defaultValue={artist?.videoUrl ?? ""}
          placeholder="https://www.youtube.com/embed/…"
          className={fieldClass}
        />
      </Field>

      <Field
        label="Status"
        htmlFor="status"
        hint="Hiding an artist removes them and their work from the public site without deleting anything."
      >
        <select
          id="status"
          name="status"
          defaultValue={artist?.status ?? "visible"}
          className={fieldClass}
        >
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
      </Field>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer border-none bg-brass px-[34px] py-[17px] font-mono text-label tracking-label text-ink uppercase transition-colors hover:bg-cream disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Saving…" : artist ? "Save changes" : "Add artist"}
        </button>
        <Link
          href="/artists"
          className="font-mono text-label tracking-nav text-slate uppercase transition-colors hover:text-bone"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

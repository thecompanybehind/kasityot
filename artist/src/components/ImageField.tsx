"use client";

import Image from "next/image";
import { useRef, useState } from "react";

/**
 * A single optional photograph.
 *
 * The artwork form uses ImageManager, which handles several images and their
 * order. A profile photo has neither concern, so this is its own small thing
 * rather than that component bent into a one-image shape.
 *
 * The value is held by the parent and posted as a hidden field, so this works
 * inside a plain form.
 */
export function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", files[0]);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onChange(json.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative size-[110px] shrink-0 overflow-hidden rounded-pill bg-ink-raised">
        {value ? (
          <Image src={value} alt="" fill sizes="110px" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center font-mono text-label-sm tracking-rail text-slate uppercase">
            None
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer border border-bone/25 px-4 py-2.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass">
          {busy ? "Uploading…" : value ? "Replace" : "Choose a photo"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            disabled={busy}
            onChange={(e) => upload(e.target.files)}
          />
        </label>

        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="cursor-pointer px-2 font-mono text-label-sm tracking-rail text-slate uppercase hover:text-bone"
          >
            Remove
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="w-full m-0 text-body-sm text-brass">
          {error}
        </p>
      ) : null}
    </div>
  );
}

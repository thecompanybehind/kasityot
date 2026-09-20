"use client";

import Image from "next/image";
import { useRef, useState } from "react";

/**
 * Multi-image upload with reordering and an explicit cover choice.
 *
 * images[0] IS the cover — "make cover" moves a photo to the front rather
 * than storing a separate flag, so the order the owner sees is the order
 * the public gallery uses.
 *
 * Values are submitted as repeated hidden `images` inputs so the whole
 * thing works inside a plain form action.
 */
export function ImageManager({ initial }: { initial: string[] }) {
  const [images, setImages] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        uploaded.push(json.url);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function makeCover(i: number) {
    move(i, 0);
  }

  function remove(i: number) {
    setImages((prev) => prev.filter((_, n) => n !== i));
  }

  return (
    <div className="min-w-0">
      <span className="block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase">
        Photographs
      </span>

      {/* Submitted with the form; order is preserved. */}
      {images.map((src) => (
        <input key={src} type="hidden" name="images" value={src} />
      ))}

      <div className="flex flex-wrap items-center gap-3 pb-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
          onChange={(e) => upload(e.target.files)}
          className="block w-full text-body-sm text-bone-muted file:mr-4 file:cursor-pointer file:border file:border-brass/45 file:bg-transparent file:px-4 file:py-2 file:font-mono file:text-label-sm file:tracking-rail file:text-brass file:uppercase hover:file:border-brass"
        />
        {busy ? (
          <span className="font-mono text-label-sm tracking-rail text-brass uppercase">
            Uploading…
          </span>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="m-0 pb-4 text-body-sm text-brass">
          {error}
        </p>
      ) : null}

      {images.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-4">
          {images.map((src, i) => (
            <div key={src + i} className="flex flex-col gap-2">
              <div className="relative aspect-square overflow-hidden border border-bone/15 bg-ink-raised">
                <Image src={src} alt="" fill sizes="130px" className="object-cover" />
                {i === 0 ? (
                  <span className="absolute top-0 left-0 m-1.5 bg-brass px-2 py-0.5 font-mono text-[8px] tracking-rail text-ink uppercase">
                    Cover
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label="Move earlier"
                  className="cursor-pointer border border-bone/20 px-2 py-1 font-mono text-[9px] text-bone-muted transition-colors hover:border-brass hover:text-brass disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === images.length - 1}
                  aria-label="Move later"
                  className="cursor-pointer border border-bone/20 px-2 py-1 font-mono text-[9px] text-bone-muted transition-colors hover:border-brass hover:text-brass disabled:opacity-30"
                >
                  →
                </button>
                {i !== 0 ? (
                  <button
                    type="button"
                    onClick={() => makeCover(i)}
                    className="cursor-pointer border border-bone/20 px-2 py-1 font-mono text-[9px] tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
                  >
                    Cover
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Remove image"
                  className="cursor-pointer border border-bone/20 px-2 py-1 font-mono text-[9px] tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="m-0 border border-bone/15 px-4 py-6 text-center text-body-sm text-slate">
          No photographs yet. The first one you add becomes the cover.
        </p>
      )}
    </div>
  );
}

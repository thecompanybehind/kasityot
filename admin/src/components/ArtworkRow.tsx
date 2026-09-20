"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusPill } from "@/components/ui";
import { deleteArtwork, setArtworkStatus } from "@/lib/actions";
import { formatPrice } from "@/lib/format";
import type { ArtworkView } from "@/lib/queries";

const STATUSES = ["available", "sold", "hidden"] as const;

export function ArtworkRow({ artwork }: { artwork: ArtworkView }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cover = artwork.images[0];

  function changeStatus(status: (typeof STATUSES)[number]) {
    start(async () => {
      await setArtworkStatus(artwork.id, status);
      router.refresh();
    });
  }

  function remove() {
    start(async () => {
      const res = await deleteArtwork(artwork.id);
      if (!res.ok) setError(res.error ?? "Could not delete.");
      else router.refresh();
      setConfirming(false);
    });
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-5 border-b border-bone/12 py-5 ${pending ? "opacity-60" : ""}`}
    >
      <div className="relative size-[68px] shrink-0 overflow-hidden bg-ink-raised">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="68px"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center font-mono text-[8px] tracking-rail text-slate uppercase">
            No img
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 basis-[240px]">
        <Link
          href={`/artworks/${artwork.id}`}
          className="font-display text-[23px] leading-tight text-cream transition-colors hover:text-brass"
        >
          {artwork.title}
        </Link>
        <div className="pt-1.5 font-mono text-label-sm tracking-rail text-slate uppercase">
          {artwork.artistName ?? "No artist"} · {artwork.images.length} image
          {artwork.images.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="font-mono text-[13px] tracking-price text-brass">
        {formatPrice(artwork.price)}
      </div>

      <StatusPill status={artwork.status} />

      <div className="flex items-center gap-2">
        {STATUSES.filter((s) => s !== artwork.status).map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => changeStatus(s)}
            className="cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass disabled:cursor-wait"
          >
            {s === "available" ? "unsell" : s}
          </button>
        ))}

        <Link
          href={`/artworks/${artwork.id}`}
          className="border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
        >
          Edit
        </Link>

        {confirming ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={remove}
              className="cursor-pointer border border-brass bg-brass px-3 py-1.5 font-mono text-label-sm tracking-rail text-ink uppercase"
            >
              Delete for good
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="cursor-pointer px-2 font-mono text-label-sm tracking-rail text-slate uppercase hover:text-bone"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
          >
            Delete
          </button>
        )}
      </div>

      {confirming ? (
        <p className="w-full font-mono text-label-sm tracking-rail text-brass uppercase">
          This also deletes every enquiry on this piece. It cannot be undone.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="w-full text-body-sm text-brass">
          {error}
        </p>
      ) : null}
    </div>
  );
}

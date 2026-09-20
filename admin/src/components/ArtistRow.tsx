"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusPill } from "@/components/ui";
import { deleteArtist, setArtistStatus } from "@/lib/actions";
import type { ArtistView } from "@/lib/queries";

export function ArtistRow({ artist }: { artist: ArtistView }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = artist.artworkCount ?? 0;

  function toggle() {
    start(async () => {
      await setArtistStatus(
        artist.id,
        artist.status === "visible" ? "hidden" : "visible",
      );
      router.refresh();
    });
  }

  function remove() {
    start(async () => {
      const res = await deleteArtist(artist.id);
      if (!res.ok) setError(res.error ?? "Could not delete.");
      else router.refresh();
      setConfirming(false);
    });
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-5 border-b border-bone/12 py-5 ${pending ? "opacity-60" : ""}`}
    >
      <div className="relative size-[68px] shrink-0 overflow-hidden rounded-pill bg-ink-raised">
        {artist.photo ? (
          <Image src={artist.photo} alt="" fill sizes="68px" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center font-mono text-[8px] tracking-rail text-slate uppercase">
            No img
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 basis-[240px]">
        <Link
          href={`/artists/${artist.id}`}
          className="font-display text-[23px] leading-tight text-cream transition-colors hover:text-brass"
        >
          {artist.name}
        </Link>
        <div className="pt-1.5 font-mono text-label-sm tracking-rail text-slate uppercase">
          {artist.craftType} · {artist.region}
        </div>
      </div>

      <div className="flex flex-col gap-1 font-mono text-label-sm tracking-rail text-slate uppercase">
        <span>
          {count} {count === 1 ? "piece" : "pieces"}
        </span>
        <span className={artist.videoUrl ? "text-brass" : "text-slate-dim"}>
          {artist.videoUrl ? "has video" : "no video"}
        </span>
      </div>

      <StatusPill status={artist.status} />

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={toggle}
          className="cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass disabled:cursor-wait"
        >
          {artist.status === "visible" ? "Hide" : "Show"}
        </button>
        <Link
          href={`/artists/${artist.id}`}
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

      {error ? (
        <p role="alert" className="w-full text-body-sm text-brass">
          {error}
        </p>
      ) : null}
    </div>
  );
}

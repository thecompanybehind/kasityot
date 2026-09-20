"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusPill } from "@/components/ui";
import { deleteArtwork, withdrawSubmission } from "@/lib/actions";
import { formatPrice } from "@/lib/format";
import type { StudioArtwork } from "@/lib/queries";

/** What each review state means, in the artist's terms rather than ours. */
const EXPLAIN: Record<StudioArtwork["reviewStatus"], string> = {
  draft: "Only you can see this. Send it to us when it is ready.",
  pending: "With us for review. We will write when we have looked.",
  approved: "On the site now.",
  rejected: "Sent back — see what we said, change it, and send it again.",
};

export function StudioArtworkRow({ artwork }: { artwork: StudioArtwork }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function remove() {
    setError(null);
    start(async () => {
      const res = await deleteArtwork(artwork.id);
      if (!res.ok) setError(res.error ?? "Could not delete.");
      else router.refresh();
      setConfirming(false);
    });
  }

  function withdraw() {
    setError(null);
    start(async () => {
      const res = await withdrawSubmission(artwork.id);
      if (!res.ok) setError(res.error ?? "Could not withdraw.");
      else router.refresh();
    });
  }

  // An artist may only remove work that has never been published; an approved
  // piece may already have enquiries or an order against it.
  const deletable =
    artwork.reviewStatus !== "approved" && !artwork.wasApproved;

  return (
    <div
      className={`border-b border-bone/12 py-5 ${pending ? "opacity-60" : ""}`}
    >
      {artwork.wasApproved && artwork.reviewStatus === "pending" ? (
        <p className="m-0 pb-3 font-mono text-label-sm tracking-rail text-brass uppercase">
          Off the site while we look at your change
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-5">
        <div className="relative h-[68px] w-[92px] shrink-0 overflow-hidden bg-ink-raised">
          {artwork.images[0] ? (
            <Image
              src={artwork.images[0]}
              alt=""
              fill
              sizes="92px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center font-mono text-label-xs tracking-rail text-slate uppercase">
              No photo
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 basis-[240px]">
          <Link
            href={`/studio/artworks/${artwork.id}`}
            className="font-display text-[23px] leading-tight text-cream transition-colors hover:text-brass"
          >
            {artwork.title || "Untitled"}
          </Link>
          <p className="m-0 max-w-[48ch] pt-1.5 text-body-sm leading-[1.6] text-slate">
            {EXPLAIN[artwork.reviewStatus]}
          </p>
        </div>

        <div className="font-mono text-label-sm tracking-rail text-bone uppercase">
          {formatPrice(artwork.priceOnRequest ? null : artwork.price)}
        </div>

        <StatusPill status={artwork.reviewStatus} />

        <div className="flex items-center gap-2">
          <Link
            href={`/studio/artworks/${artwork.id}`}
            className="border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
          >
            {artwork.reviewStatus === "approved" ? "Edit" : "Open"}
          </Link>

          {artwork.reviewStatus === "pending" && !artwork.wasApproved ? (
            <button
              type="button"
              disabled={pending}
              onClick={withdraw}
              className="cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
            >
              Take back
            </button>
          ) : null}

          {deletable ? (
            confirming ? (
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
            )
          ) : null}
        </div>
      </div>

      {artwork.reviewStatus === "rejected" && artwork.reviewNote ? (
        <p className="mt-3 ml-[112px] max-w-[60ch] text-body-sm leading-[1.6] text-bone-muted">
          <span className="text-brass">We said:</span> {artwork.reviewNote}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 ml-[112px] text-body-sm text-brass">
          {error}
        </p>
      ) : null}
    </div>
  );
}

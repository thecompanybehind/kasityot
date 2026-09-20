"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusPill } from "@/components/ui";
import { approveArtwork, rejectArtwork } from "@/lib/actions";
import { formatPrice } from "@/lib/format";
import type { ArtworkView } from "@/lib/queries";

/**
 * One piece awaiting review, decided inline.
 *
 * A piece that was live and has since been edited is called out: it is off
 * the public site until approved again, which costs the owner a listing for
 * as long as it sits here.
 */
export function SubmissionRow({ artwork }: { artwork: ArtworkView }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function approve() {
    setError(null);
    start(async () => {
      const res = await approveArtwork(artwork.id);
      if (!res.ok) setError(res.error ?? "Could not approve.");
      else router.refresh();
    });
  }

  function reject() {
    setError(null);
    start(async () => {
      const res = await rejectArtwork(artwork.id, note);
      if (!res.ok) setError(res.error ?? "Could not reject.");
      else {
        setRejecting(false);
        setNote("");
        router.refresh();
      }
    });
  }

  const submitted = artwork.submittedAt
    ? new Date(artwork.submittedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : null;

  // The owner may re-price on review, so show what was asked for when it
  // differs from what is currently set.
  const proposedDiffers =
    artwork.proposedPrice !== null && artwork.proposedPrice !== artwork.price;

  return (
    <div
      className={`border-b border-bone/12 py-5 ${pending ? "opacity-60" : ""}`}
    >
      {artwork.wasApproved ? (
        <p className="m-0 pb-3 font-mono text-label-sm tracking-rail text-brass uppercase">
          Was live · edited · off the site until approved
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
            {artwork.artistName ?? "Unknown artist"}
            {submitted ? ` · sent ${submitted}` : ""}
          </div>
          <div className="pt-1 font-mono text-label-sm tracking-rail text-slate-dim">
            {artwork.material} · {artwork.dimensions} · {artwork.images.length}{" "}
            {artwork.images.length === 1 ? "photo" : "photos"}
          </div>
        </div>

        <div className="flex flex-col gap-1 font-mono text-label-sm tracking-rail text-slate uppercase">
          <span className="text-bone">
            {formatPrice(artwork.priceOnRequest ? null : artwork.price)}
          </span>
          {proposedDiffers ? (
            <span className="text-slate-dim">
              asked {formatPrice(artwork.proposedPrice)}
            </span>
          ) : null}
        </div>

        <StatusPill status={artwork.reviewStatus} />

        <div className="flex items-center gap-2">
          <Link
            href={`/artworks/${artwork.id}`}
            className="border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
          >
            Open
          </Link>

          {artwork.reviewStatus !== "approved" ? (
            <button
              type="button"
              disabled={pending}
              onClick={approve}
              className="cursor-pointer border border-brass bg-brass px-3 py-1.5 font-mono text-label-sm tracking-rail text-ink uppercase disabled:cursor-wait"
            >
              Approve
            </button>
          ) : null}

          {artwork.reviewStatus !== "rejected" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => setRejecting((v) => !v)}
              className="cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
            >
              Reject
            </button>
          ) : null}
        </div>
      </div>

      {rejecting ? (
        <div className="flex flex-wrap items-end gap-3 pt-4 pl-[112px]">
          <label className="min-w-0 flex-1 basis-[320px]">
            <span className="block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase">
              What needs changing? The artist is shown this.
            </span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. The photographs are too dark — please reshoot in daylight."
              className="w-full border border-brass/35 bg-transparent px-4 py-2.5 text-body-sm text-bone outline-none focus:border-brass"
            />
          </label>
          <button
            type="button"
            disabled={pending || !note.trim()}
            onClick={reject}
            className="cursor-pointer border border-brass bg-brass px-3 py-2.5 font-mono text-label-sm tracking-rail text-ink uppercase disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send back
          </button>
          <button
            type="button"
            onClick={() => setRejecting(false)}
            className="cursor-pointer px-2 py-2.5 font-mono text-label-sm tracking-rail text-slate uppercase hover:text-bone"
          >
            Cancel
          </button>
        </div>
      ) : null}

      {artwork.reviewStatus === "rejected" && artwork.reviewNote ? (
        <p className="mt-3 ml-[112px] max-w-[60ch] text-body-sm leading-[1.6] text-slate">
          Sent back: {artwork.reviewNote}
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

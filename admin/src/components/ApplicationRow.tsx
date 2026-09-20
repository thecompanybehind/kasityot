"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusPill } from "@/components/ui";
import {
  approveArtistApplication,
  rejectArtistApplication,
  resendArtistInvite,
} from "@/lib/actions";
import type { ArtistView } from "@/lib/queries";

/**
 * One artist application, with the whole decision inline — the owner should
 * not have to open a detail page to approve someone.
 *
 * Approving returns an invite link that is shown once and never again: only
 * its hash is stored. The link therefore stays on screen until dismissed,
 * rather than vanishing on the refresh.
 */
export function ApplicationRow({ artist }: { artist: ArtistView }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function approve() {
    setError(null);
    start(async () => {
      const res = await approveArtistApplication(artist.id);
      if (!res.ok) setError(res.error ?? "Could not approve.");
      else {
        setInvite(res.inviteUrl ?? null);
        router.refresh();
      }
    });
  }

  function reject() {
    setError(null);
    start(async () => {
      const res = await rejectArtistApplication(artist.id, note);
      if (!res.ok) setError(res.error ?? "Could not reject.");
      else {
        setRejecting(false);
        setNote("");
        router.refresh();
      }
    });
  }

  function resend() {
    setError(null);
    start(async () => {
      const res = await resendArtistInvite(artist.id);
      if (!res.ok) setError(res.error ?? "Could not create a new link.");
      else setInvite(res.inviteUrl ?? null);
    });
  }

  async function copy() {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; the link is on screen to copy by hand.
      setCopied(false);
    }
  }

  const applied = artist.createdAt
    ? new Date(artist.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={`border-b border-bone/12 py-5 ${pending ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative size-[68px] shrink-0 overflow-hidden rounded-pill bg-ink-raised">
          {artist.photo ? (
            <Image
              src={artist.photo}
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
            href={`/applications/${artist.id}`}
            className="font-display text-[23px] leading-tight text-cream transition-colors hover:text-brass"
          >
            {artist.name}
          </Link>
          <div className="pt-1.5 font-mono text-label-sm tracking-rail text-slate uppercase">
            {artist.craftType} · {artist.region}
          </div>
          <div className="pt-1 font-mono text-label-sm tracking-rail text-slate-dim">
            {artist.email ?? "no email"}
            {artist.phone ? ` · ${artist.phone}` : ""}
          </div>
        </div>

        <div className="flex flex-col gap-1 font-mono text-label-sm tracking-rail text-slate uppercase">
          {applied ? <span>applied {applied}</span> : null}
          {artist.applicationStatus === "approved" ? (
            <span className={artist.hasLogin ? "text-brass" : "text-slate-dim"}>
              {artist.hasLogin ? "signed in" : "invite not used"}
            </span>
          ) : null}
        </div>

        <StatusPill status={artist.applicationStatus} />

        <div className="flex items-center gap-2">
          <Link
            href={`/applications/${artist.id}`}
            className="border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
          >
            Read
          </Link>

          {artist.applicationStatus === "pending" ? (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={approve}
                className="cursor-pointer border border-brass bg-brass px-3 py-1.5 font-mono text-label-sm tracking-rail text-ink uppercase disabled:cursor-wait"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setRejecting((v) => !v)}
                className="cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
              >
                Reject
              </button>
            </>
          ) : null}

          {artist.applicationStatus === "approved" && !artist.hasLogin ? (
            <button
              type="button"
              disabled={pending}
              onClick={resend}
              className="cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
            >
              New invite link
            </button>
          ) : null}
        </div>
      </div>

      {rejecting ? (
        <div className="flex flex-wrap items-end gap-3 pt-4 pl-[88px]">
          <label className="min-w-0 flex-1 basis-[320px]">
            <span className="block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase">
              Why? The artist is shown this.
            </span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. We already work with a weaver in this region."
              className="w-full border border-brass/35 bg-transparent px-4 py-2.5 text-body-sm text-bone outline-none focus:border-brass"
            />
          </label>
          <button
            type="button"
            disabled={pending || !note.trim()}
            onClick={reject}
            className="cursor-pointer border border-brass bg-brass px-3 py-2.5 font-mono text-label-sm tracking-rail text-ink uppercase disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send rejection
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

      {invite ? (
        <div className="mt-4 ml-[88px] border border-brass/40 bg-brass/5 px-4 py-3">
          <div className="pb-2 font-mono text-label-sm tracking-rail text-brass uppercase">
            Invite link — shown once
          </div>
          <p className="m-0 pb-3 text-body-sm leading-[1.6] text-bone-muted">
            Send this to {artist.name}. It lets them set a password and sign in,
            expires in 14 days, and cannot be shown again — make a new one if
            it is lost.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <code className="min-w-0 flex-1 basis-[280px] overflow-x-auto border border-bone/20 px-3 py-2 font-mono text-[12px] text-bone">
              {invite}
            </code>
            <button
              type="button"
              onClick={copy}
              className="cursor-pointer border border-brass px-3 py-2 font-mono text-label-sm tracking-rail text-brass uppercase transition-colors hover:bg-brass hover:text-ink"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={() => setInvite(null)}
              className="cursor-pointer px-2 font-mono text-label-sm tracking-rail text-slate uppercase hover:text-bone"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}

      {artist.applicationStatus === "rejected" && artist.reviewNote ? (
        <p className="mt-3 ml-[88px] max-w-[60ch] text-body-sm leading-[1.6] text-slate">
          Rejected: {artist.reviewNote}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 ml-[88px] text-body-sm text-brass">
          {error}
        </p>
      ) : null}
    </div>
  );
}

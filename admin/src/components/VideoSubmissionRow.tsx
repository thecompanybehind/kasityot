"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusPill } from "@/components/ui";
import { VideoPlayer } from "@/components/VideoPlayer";
import { approveVideo, rejectVideo } from "@/lib/actions";
import type { ArtistView } from "@/lib/queries";

/**
 * One artist's video awaiting review, decided inline.
 *
 * The player sits in the row itself: a video cannot be judged from a
 * thumbnail, and sending the owner to another page to watch it would make
 * approving one a three-click job.
 */
export function VideoSubmissionRow({ artist }: { artist: ArtistView }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const url = artist.pendingVideoUrl;
  if (!url) return null;

  function approve(videoUrl: string) {
    setError(null);
    start(async () => {
      const res = await approveVideo(artist.id, videoUrl);
      if (!res.ok) setError(res.error ?? "Could not approve.");
      else router.refresh();
    });
  }

  function reject() {
    setError(null);
    start(async () => {
      const res = await rejectVideo(artist.id, note);
      if (!res.ok) setError(res.error ?? "Could not reject.");
      else {
        setRejecting(false);
        setNote("");
        router.refresh();
      }
    });
  }

  const submitted = artist.videoSubmittedAt
    ? new Date(artist.videoSubmittedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div
      className={`border-b border-bone/12 py-5 ${pending ? "opacity-60" : ""}`}
    >
      {artist.videoUrl ? (
        <p className="m-0 pb-3 font-mono text-label-sm tracking-rail text-brass uppercase">
          Replaces the video now on the site
        </p>
      ) : null}

      <div className="flex flex-wrap items-start gap-5">
        <div className="w-full max-w-[420px] shrink-0">
          <VideoPlayer url={url} title={`${artist.name} at work`} />
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
            {submitted ? ` · sent ${submitted}` : ""}
          </div>
          <p className="m-0 max-w-[44ch] pt-3 text-body-sm leading-[1.6] text-slate">
            Once approved it shows on their profile and beneath each of their
            pieces.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-4">
            <StatusPill status="pending" />
            <button
              type="button"
              disabled={pending}
              onClick={() => approve(url)}
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
          </div>

          {rejecting ? (
            <div className="flex flex-wrap items-end gap-3 pt-4">
              <label className="min-w-0 flex-1 basis-[320px]">
                <span className="block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase">
                  What needs changing? The artist is shown this.
                </span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Too dark to see your hands — please film near a window."
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

          {error ? (
            <p role="alert" className="m-0 pt-3 text-body-sm text-brass">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

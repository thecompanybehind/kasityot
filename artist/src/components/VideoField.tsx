"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { VIDEO_MAX_BYTES } from "@kasityot/core/video";
import { VideoPlayer } from "@/components/VideoPlayer";
import { labelClass } from "@/components/ui";
import { submitVideo, withdrawVideo } from "@/lib/actions";
import type { StudioArtist } from "@/lib/queries";

type Signed = {
  url: string;
  apiKey: string;
  signature: string;
  params: Record<string, string>;
};

/**
 * Sends the file straight to Cloudinary and reports progress as it goes.
 *
 * XMLHttpRequest rather than fetch: fetch cannot report upload progress, and
 * a video sent over a phone connection with no sign of movement looks hung.
 */
function sendToCloudinary(
  signed: Signed,
  file: File,
  onProgress: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    for (const [key, value] of Object.entries(signed.params)) {
      body.append(key, value);
    }
    body.append("api_key", signed.apiKey);
    body.append("signature", signed.signature);
    body.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", signed.url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () =>
      reject(new Error("The upload was interrupted. Please try again."));
    xhr.onload = () => {
      let json: { secure_url?: string; error?: { message?: string } } = {};
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        // Not JSON: fall through to the generic message below.
      }
      if (xhr.status >= 200 && xhr.status < 300 && json.secure_url) {
        resolve(json.secure_url);
      } else {
        reject(new Error(json.error?.message ?? "The upload failed."));
      }
    };
    xhr.send(body);
  });
}

/**
 * The artist's one video of themselves at work.
 *
 * Separate from the profile form and its Save button on purpose: the rest of
 * the profile saves straight away, while a video goes to Kasityot first.
 * Choosing a file uploads it and sends it for review in one step, so there is
 * no half-finished state for an artist to leave behind.
 */
export function VideoField({ artist }: { artist: StudioArtist }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, startWithdraw] = useTransition();

  const uploading = progress !== null;
  const { videoUrl, pendingVideoUrl, videoReviewStatus } = artist;
  const pending = videoReviewStatus === "pending" && pendingVideoUrl;
  const rejected = videoReviewStatus === "rejected";

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("video/")) {
      setError("That is not a video file.");
      return;
    }
    if (file.size > VIDEO_MAX_BYTES) {
      setError(
        "That video is over 100 MB. Please send a shorter one — a minute or two is plenty.",
      );
      return;
    }

    setProgress(0);
    try {
      const res = await fetch("/api/upload/video", { method: "POST" });
      const signed = await res.json();
      if (!res.ok) throw new Error(signed.error ?? "Could not start the upload.");

      const url = await sendToCloudinary(signed, file, setProgress);
      const saved = await submitVideo(url);
      if (!saved.ok) throw new Error(saved.error ?? "Could not send the video.");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function withdraw() {
    setError(null);
    startWithdraw(async () => {
      const res = await withdrawVideo();
      if (!res.ok) setError(res.error ?? "Could not withdraw the video.");
      else router.refresh();
    });
  }

  const chooseLabel = uploading
    ? `Uploading… ${progress}%`
    : pending || videoUrl
      ? "Send a different video"
      : rejected
        ? "Choose another video"
        : "Choose a video";

  return (
    <section className="grid max-w-[680px] gap-5">
      <div>
        <span className={labelClass}>Your video</span>
        <p className="m-0 max-w-[58ch] text-body-sm leading-[1.7] text-bone-muted">
          One short video of you at work. We look at it first; once approved it
          appears on your page and beneath each of your pieces.
        </p>
      </div>

      {pending ? (
        <div className="grid gap-3">
          <p className="m-0 font-mono text-label-sm tracking-rail text-brass uppercase">
            With Kasityot for review
          </p>
          <VideoPlayer url={pendingVideoUrl} title="Your video, awaiting review" />
        </div>
      ) : null}

      {rejected ? (
        <div className="border border-brass/45 px-5 py-4">
          <p className="m-0 pb-2 font-mono text-label-sm tracking-rail text-brass uppercase">
            Sent back
          </p>
          <p className="m-0 text-body-sm leading-[1.7] text-bone">
            {artist.videoReviewNote ||
              "We could not use this video. Please send another."}
          </p>
        </div>
      ) : null}

      {videoUrl ? (
        <div className="grid gap-3">
          <p className="m-0 font-mono text-label-sm tracking-rail text-slate uppercase">
            {pending ? "On the site until the new one is approved" : "On the site"}
          </p>
          <VideoPlayer url={videoUrl} title="Your video on the site" />
        </div>
      ) : null}

      {uploading ? (
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Upload progress"
          className="h-px w-full bg-bone/15"
        >
          <div
            className="h-px bg-brass transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <label
          className={`border border-bone/25 px-4 py-2.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors ${
            uploading
              ? "cursor-wait"
              : "cursor-pointer hover:border-brass hover:text-brass"
          }`}
        >
          {chooseLabel}
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            hidden
            disabled={uploading}
            onChange={(e) => upload(e.target.files)}
          />
        </label>

        {pending && !uploading ? (
          <button
            type="button"
            disabled={withdrawing}
            onClick={withdraw}
            className="cursor-pointer px-2 font-mono text-label-sm tracking-rail text-slate uppercase hover:text-bone disabled:cursor-wait"
          >
            Withdraw
          </button>
        ) : null}
      </div>

      {uploading ? (
        <p className="m-0 text-body-sm text-slate">
          Keep this page open until the upload finishes.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="m-0 text-body-sm text-brass">
          {error}
        </p>
      ) : null}
    </section>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusPill } from "@/components/ui";
import { saveEnquiryNotes, setEnquiryStatus } from "@/lib/actions";
import { formatDateTime, timeAgo } from "@/lib/format";
import type { EnquiryView } from "@/lib/queries";

const STATUSES = ["new", "contacted", "closed"] as const;

export function EnquiryCard({ enquiry }: { enquiry: EnquiryView }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [notes, setNotes] = useState(enquiry.ownerNotes);
  const [saved, setSaved] = useState(false);

  const dirty = notes !== enquiry.ownerNotes;

  function changeStatus(status: (typeof STATUSES)[number]) {
    start(async () => {
      await setEnquiryStatus(enquiry.id, status);
      router.refresh();
    });
  }

  function persistNotes() {
    start(async () => {
      await saveEnquiryNotes(enquiry.id, notes);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <article
      className={`border border-brass/22 p-6 transition-opacity ${pending ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="m-0 font-display text-[26px] leading-tight text-cream">
            {enquiry.name}
          </h3>
          <div className="flex flex-wrap gap-4 pt-2 font-mono text-label-sm tracking-rail text-slate uppercase">
            <a
              href={`tel:${enquiry.phone.replace(/\s/g, "")}`}
              className="text-brass transition-colors hover:text-cream"
            >
              {enquiry.phone}
            </a>
            <span>{enquiry.city}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusPill status={enquiry.status} />
          <time
            dateTime={enquiry.createdAt}
            title={formatDateTime(enquiry.createdAt)}
            className="font-mono text-label-sm tracking-rail text-slate uppercase"
          >
            {timeAgo(enquiry.createdAt)}
          </time>
        </div>
      </div>

      <div className="pt-4 font-mono text-label-sm tracking-rail text-brass uppercase">
        {enquiry.artworkTitle ?? "Artwork no longer listed"}
      </div>

      <p className="m-0 border-t border-bone/12 pt-4 text-body leading-[1.7] text-bone-soft">
        {enquiry.message}
      </p>

      <div className="flex flex-wrap items-center gap-2 pt-5">
        <span className="pr-2 font-mono text-label-sm tracking-rail text-slate uppercase">
          Mark as
        </span>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending || s === enquiry.status}
            onClick={() => changeStatus(s)}
            className={`cursor-pointer border px-3 py-1.5 font-mono text-label-sm tracking-rail uppercase transition-colors disabled:cursor-default ${
              s === enquiry.status
                ? "border-brass bg-brass text-ink"
                : "border-bone/25 text-bone-muted hover:border-brass hover:text-brass"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="pt-5">
        <label
          htmlFor={`notes-${enquiry.id}`}
          className="block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase"
        >
          Private notes
        </label>
        <textarea
          id={`notes-${enquiry.id}`}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Called on the 14th, sending more photos…"
          className="w-full resize-y border border-brass/30 bg-transparent px-4 py-3 text-body-sm text-bone outline-none transition-colors focus:border-brass"
        />
        <div className="flex items-center gap-4 pt-2">
          <button
            type="button"
            disabled={pending || !dirty}
            onClick={persistNotes}
            className="cursor-pointer border border-bone/25 px-4 py-2 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass disabled:opacity-35"
          >
            Save note
          </button>
          {saved ? (
            <span
              role="status"
              className="font-mono text-label-sm tracking-rail text-brass uppercase"
            >
              Saved
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

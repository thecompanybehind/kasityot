"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusPill } from "@/components/ui";
import { approveWholesaler, rejectWholesaler } from "@/lib/wholesale-actions";
import { formatDateTime } from "@/lib/format";
import type { WholesalerView } from "@/lib/wholesale-queries";

/**
 * One wholesaler account, with the decision inline.
 *
 * Approving opens the trade catalogue to them; rejecting, or revoking an
 * approved account, needs a reason because they are shown it. Either can be
 * reversed later: a rejected account can still be approved.
 */
export function WholesalerRow({ wholesaler: w }: { wholesaler: WholesalerView }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [open, setOpen] = useState(w.status === "pending");

  function approve() {
    setError(null);
    start(async () => {
      const res = await approveWholesaler(w.id);
      if (!res.ok) setError(res.error ?? "Could not approve.");
      else {
        setNotice(
          res.emailed
            ? `Approved. We have emailed ${w.email} to say so.`
            : `Approved. The email did not go out, so let ${w.contactName} know they can sign in.`,
        );
        router.refresh();
      }
    });
  }

  function reject() {
    setError(null);
    start(async () => {
      const res = await rejectWholesaler(w.id, note);
      if (!res.ok) setError(res.error ?? "Could not save.");
      else {
        setRejecting(false);
        setNote("");
        router.refresh();
      }
    });
  }

  return (
    <div className={`border-b border-bone/12 py-5 ${pending ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-5">
        <div className="min-w-0 flex-1 basis-[260px]">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="cursor-pointer text-left font-display text-[23px] leading-tight text-cream transition-colors hover:text-brass"
          >
            {w.businessName}
          </button>
          <div className="pt-1.5 font-mono text-label-sm tracking-rail text-slate uppercase">
            {w.contactName} · {w.city}
          </div>
          <div className="flex flex-wrap gap-x-3 pt-1 font-mono text-label-sm tracking-rail text-slate-dim">
            <a href={`mailto:${w.email}`} className="hover:text-brass">
              {w.email}
            </a>
            <a href={`tel:${w.phone.replace(/\s/g, "")}`} className="hover:text-brass">
              {w.phone}
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-1 font-mono text-label-sm tracking-rail text-slate uppercase">
          {w.createdAt ? <span>registered {formatDateTime(w.createdAt)}</span> : null}
          {w.status === "approved" ? (
            <span className={w.lastLoginAt ? "text-brass" : "text-slate-dim"}>
              {w.lastLoginAt ? `last in ${formatDateTime(w.lastLoginAt)}` : "not signed in yet"}
            </span>
          ) : null}
        </div>

        <StatusPill status={w.status} />

        <div className="flex items-center gap-2">
          {w.status !== "approved" ? (
            <button
              type="button"
              disabled={pending}
              onClick={approve}
              className="cursor-pointer border border-brass bg-brass px-3 py-1.5 font-mono text-label-sm tracking-rail text-ink uppercase disabled:cursor-wait"
            >
              Approve
            </button>
          ) : null}
          {w.status !== "rejected" ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => setRejecting((v) => !v)}
              className="cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
            >
              {w.status === "approved" ? "Revoke" : "Reject"}
            </button>
          ) : null}
        </div>
      </div>

      {open ? (
        <dl className="mt-4 grid max-w-[720px] grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-body-sm leading-[1.6]">
          <dt className="font-mono text-label-sm tracking-rail text-slate uppercase">GSTIN</dt>
          <dd className="m-0 text-bone-soft">{w.gstin || "Not given"}</dd>
          <dt className="font-mono text-label-sm tracking-rail text-slate uppercase">About</dt>
          <dd className="m-0 whitespace-pre-line text-bone-soft">{w.about || "Not given"}</dd>
        </dl>
      ) : null}

      {rejecting ? (
        <div className="flex flex-wrap items-end gap-3 pt-4">
          <label className="min-w-0 flex-1 basis-[320px]">
            <span className="block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase">
              Why? The wholesaler is shown this.
            </span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. We only supply registered retailers at the moment."
              className="w-full border border-brass/35 bg-transparent px-4 py-2.5 text-body-sm text-bone outline-none focus:border-brass"
            />
          </label>
          <button
            type="button"
            disabled={pending || !note.trim()}
            onClick={reject}
            className="cursor-pointer border border-brass bg-brass px-3 py-2.5 font-mono text-label-sm tracking-rail text-ink uppercase disabled:cursor-not-allowed disabled:opacity-40"
          >
            {w.status === "approved" ? "Revoke access" : "Send rejection"}
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

      {w.status === "rejected" && w.reviewNote ? (
        <p className="mt-3 max-w-[60ch] text-body-sm leading-[1.6] text-slate">
          Rejected: {w.reviewNote}
        </p>
      ) : null}

      {notice ? (
        <p role="status" className="mt-3 text-body-sm text-brass">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-body-sm text-brass">
          {error}
        </p>
      ) : null}
    </div>
  );
}

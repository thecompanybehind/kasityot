"use client";

import { useState, useTransition } from "react";
import { submitEnquiry, type EnquiryResult } from "@/lib/enquiry-actions";

const field =
  "w-full min-w-0 border bg-transparent px-4 py-3 text-body text-bone outline-none transition-colors";

const label =
  "block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase";

export function EnquiryForm({
  artworkId,
  artworkTitle,
  onClose,
}: {
  artworkId: string;
  artworkTitle: string;
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<EnquiryResult | null>(null);
  const [done, setDone] = useState(false);

  function submit(formData: FormData) {
    setResult(null);
    start(async () => {
      const res = await submitEnquiry(artworkId, formData);
      setResult(res);
      if (res.ok) setDone(true);
    });
  }

  if (done) {
    return (
      <div
        role="status"
        className="border border-brass/45 px-6 py-8 text-center"
      >
        <div className="font-display text-card-title text-cream">
          Thank you — your enquiry is with us.
        </div>
        <p className="m-0 pt-3 text-body-sm leading-[1.7] text-bone-muted">
          We will call you about &ldquo;{artworkTitle}&rdquo; within two working
          days.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 cursor-pointer font-mono text-label tracking-nav text-brass uppercase transition-colors hover:text-cream"
        >
          Close
        </button>
      </div>
    );
  }

  const fe = result?.fieldErrors ?? {};
  const cls = (k: keyof typeof fe) =>
    `${field} ${fe[k] ? "border-brass" : "border-brass/35 focus:border-brass"}`;

  return (
    <form action={submit} className="flex flex-col gap-5">
      {result?.error ? (
        <div
          role="alert"
          className="border border-brass/45 px-4 py-3 text-body-sm text-brass"
        >
          {result.error}
        </div>
      ) : null}

      {/*
        Honeypot. Hidden from sight and from screen readers, and excluded
        from tab order, so only a bot filling every input will touch it.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company (leave blank)</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="eq-name" className={label}>
          Your name
        </label>
        <input
          id="eq-name"
          name="name"
          required
          autoComplete="name"
          aria-invalid={Boolean(fe.name)}
          className={cls("name")}
        />
        {fe.name ? (
          <p className="m-0 pt-2 text-body-sm text-brass">{fe.name}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="eq-phone" className={label}>
            Phone
          </label>
          <input
            id="eq-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            placeholder="98450 00000"
            aria-invalid={Boolean(fe.phone)}
            className={cls("phone")}
          />
          {fe.phone ? (
            <p className="m-0 pt-2 text-body-sm text-brass">{fe.phone}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="eq-city" className={label}>
            City
          </label>
          <input
            id="eq-city"
            name="city"
            required
            autoComplete="address-level2"
            aria-invalid={Boolean(fe.city)}
            className={cls("city")}
          />
          {fe.city ? (
            <p className="m-0 pt-2 text-body-sm text-brass">{fe.city}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="eq-message" className={label}>
          Your message
        </label>
        <textarea
          id="eq-message"
          name="message"
          rows={4}
          required
          placeholder="Is this still available? I would like it for…"
          aria-invalid={Boolean(fe.message)}
          className={`${cls("message")} resize-y`}
        />
        {fe.message ? (
          <p className="m-0 pt-2 text-body-sm text-brass">{fe.message}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer border-none bg-brass px-[34px] py-[17px] font-mono text-label tracking-label text-ink uppercase transition-colors hover:bg-cream disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send enquiry"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer font-mono text-label tracking-nav text-slate uppercase transition-colors hover:text-bone"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

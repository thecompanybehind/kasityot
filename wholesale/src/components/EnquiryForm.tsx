"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Field, fieldClass } from "@/components/ui";
import { sendEnquiry } from "@/lib/actions";

export function EnquiryForm({
  productId,
  minOrderQty,
  hasPrice,
}: {
  productId: string;
  minOrderQty: number | null;
  hasPrice: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // onSubmit, not a form action: a refused enquiry (say, under the minimum
  // order) keeps the message typed. It is cleared only once it has gone.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      const res = await sendEnquiry(productId, formData);
      if (!res.ok) setError(res.error ?? "Could not send.");
      else {
        setSent(true);
        formRef.current?.reset();
      }
    });
  }

  if (sent) {
    return (
      <div role="status" className="border border-brass/45 px-5 py-5">
        <div className="pb-2 font-mono text-label-sm tracking-rail text-brass uppercase">
          Enquiry sent
        </div>
        <p className="m-0 text-body-sm leading-[1.7] text-bone-muted">
          We will come back to you by email or phone.{" "}
          <Link href="/enquiries" className="text-brass underline underline-offset-4 hover:text-cream">
            See your enquiries
          </Link>{" "}
          or{" "}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="cursor-pointer text-brass underline underline-offset-4 hover:text-cream"
          >
            send another
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid gap-6">
      <Field
        label="Quantity (units)"
        htmlFor="quantity"
        hint={
          minOrderQty
            ? `Optional. The minimum order is ${minOrderQty}.`
            : "Optional, but it lets us quote you properly."
        }
      >
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={minOrderQty ?? 1}
          step={1}
          className={fieldClass}
        />
      </Field>

      <Field label="Message" htmlFor="message">
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          defaultValue={hasPrice ? "" : "Please send me your price for this product."}
          className={`${fieldClass} resize-y leading-[1.7]`}
        />
      </Field>

      {error ? (
        <p role="alert" className="m-0 text-body-sm text-brass">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer border border-brass bg-brass px-[26px] py-[14px] font-mono text-label tracking-label text-ink uppercase transition-colors hover:bg-cream hover:border-cream disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Sending…" : hasPrice ? "Send enquiry" : "Ask for a price"}
      </button>
    </form>
  );
}

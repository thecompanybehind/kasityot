"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageManager } from "@/components/ImageManager";
import { Field, fieldClass } from "@/components/ui";
import { saveWholesaleProduct } from "@/lib/wholesale-actions";
import type { WholesaleProductView } from "@/lib/wholesale-queries";

/**
 * Adds or edits a wholesale product. Nothing saved here appears on the
 * public shop: these products live in their own collection, read only by
 * this panel and the wholesaler panel.
 */
export function WholesaleProductForm({
  product,
}: {
  product: WholesaleProductView | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // onSubmit, not a form action: React resets a form after its action
  // returns, which on a refused save would throw away the owner's edits.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      const res = await saveWholesaleProduct(product?.id ?? null, formData);
      if (!res.ok) setError(res.error ?? "Could not save.");
      else {
        router.push("/wholesale");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-[860px] flex-col gap-7">
      {error ? (
        <div
          role="alert"
          className="border border-brass/45 px-4 py-3 text-body-sm text-brass"
        >
          {error}
        </div>
      ) : null}

      <p className="m-0 border border-brass/25 px-4 py-3 text-body-sm leading-[1.6] text-bone-muted">
        Wholesale products are shown only to approved wholesalers on the
        wholesaler panel. They never appear on the public shop.
      </p>

      <Field label="Title" htmlFor="title">
        <input
          id="title"
          name="title"
          required
          defaultValue={product?.title}
          className={fieldClass}
        />
      </Field>

      <Field label="Description" htmlFor="description">
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={product?.description}
          className={`${fieldClass} resize-y`}
        />
      </Field>

      <Field
        label="Category"
        htmlFor="category"
        hint="Optional. Groups the catalogue, so keep the spelling the same each time."
      >
        <input
          id="category"
          name="category"
          defaultValue={product?.category}
          placeholder="e.g. Blue pottery"
          className={fieldClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Field label="Material" htmlFor="material" hint="Optional.">
          <input
            id="material"
            name="material"
            defaultValue={product?.material}
            className={fieldClass}
          />
        </Field>
        <Field label="Dimensions" htmlFor="dimensions" hint="Optional.">
          <input
            id="dimensions"
            name="dimensions"
            defaultValue={product?.dimensions}
            className={fieldClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Field
          label="Trade price per unit (₹)"
          htmlFor="price"
          hint="Optional. Leave blank and wholesalers see “Contact for price” with your phone, WhatsApp and email."
        >
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={1}
            defaultValue={product?.price != null ? product.price / 100 : ""}
            className={fieldClass}
          />
        </Field>
        <Field
          label="Minimum order (units)"
          htmlFor="minOrderQty"
          hint="Optional. Leave blank for no minimum."
        >
          <input
            id="minOrderQty"
            name="minOrderQty"
            type="number"
            min={1}
            step={1}
            defaultValue={product?.minOrderQty ?? ""}
            className={fieldClass}
          />
        </Field>
      </div>

      <ImageManager initial={product?.images ?? []} />

      <Field
        label="Status"
        htmlFor="status"
        hint="Hidden takes it out of the wholesaler panel without deleting it."
      >
        <select
          id="status"
          name="status"
          defaultValue={product?.status ?? "visible"}
          className={fieldClass}
        >
          <option value="visible">Visible to wholesalers</option>
          <option value="hidden">Hidden</option>
        </select>
      </Field>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer border-none bg-brass px-[34px] py-[17px] font-mono text-label tracking-label text-ink uppercase transition-colors hover:bg-cream disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Saving…" : product ? "Save changes" : "Add product"}
        </button>
        <Link
          href="/wholesale"
          className="font-mono text-label tracking-nav text-slate uppercase transition-colors hover:text-bone"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

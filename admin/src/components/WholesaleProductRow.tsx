"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { StatusPill } from "@/components/ui";
import {
  deleteWholesaleProduct,
  setWholesaleProductStatus,
} from "@/lib/wholesale-actions";
import { formatTradePrice } from "@/lib/format";
import type { WholesaleProductView } from "@/lib/wholesale-queries";

export function WholesaleProductRow({
  product,
}: {
  product: WholesaleProductView;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const cover = product.images[0];
  const enquiries = product.enquiryCount ?? 0;

  function toggle() {
    start(async () => {
      await setWholesaleProductStatus(
        product.id,
        product.status === "visible" ? "hidden" : "visible",
      );
      router.refresh();
    });
  }

  function remove() {
    start(async () => {
      await deleteWholesaleProduct(product.id);
      setConfirming(false);
      router.refresh();
    });
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-5 border-b border-bone/12 py-5 ${pending ? "opacity-60" : ""}`}
    >
      <div className="relative size-[68px] shrink-0 overflow-hidden bg-ink-raised">
        {cover ? (
          <Image src={cover} alt="" fill sizes="68px" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center font-mono text-[8px] tracking-rail text-slate uppercase">
            No img
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 basis-[240px]">
        <Link
          href={`/wholesale/products/${product.id}`}
          className="font-display text-[23px] leading-tight text-cream transition-colors hover:text-brass"
        >
          {product.title}
        </Link>
        <div className="pt-1.5 font-mono text-label-sm tracking-rail text-slate uppercase">
          {[
            product.category || "No category",
            product.minOrderQty ? `min. ${product.minOrderQty} units` : null,
            `${enquiries} ${enquiries === 1 ? "enquiry" : "enquiries"}`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>

      <div className="font-mono text-[13px] tracking-price text-brass">
        {formatTradePrice(product.price)}
      </div>

      <StatusPill status={product.status} />

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={toggle}
          className="cursor-pointer border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass disabled:cursor-wait"
        >
          {product.status === "visible" ? "Hide" : "Show"}
        </button>
        <Link
          href={`/wholesale/products/${product.id}`}
          className="border border-bone/25 px-3 py-1.5 font-mono text-label-sm tracking-rail text-bone-muted uppercase transition-colors hover:border-brass hover:text-brass"
        >
          Edit
        </Link>
        {confirming ? (
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
        )}
      </div>

      {confirming ? (
        <p className="w-full font-mono text-label-sm tracking-rail text-brass uppercase">
          This also deletes every wholesale enquiry about it. It cannot be undone.
        </p>
      ) : null}
    </div>
  );
}

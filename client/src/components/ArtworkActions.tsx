"use client";

import { useState } from "react";

type Props = {
  artworkId: string;
  artworkTitle: string;
  sold: boolean;
  priceOnRequest: boolean;
};

/**
 * The two buyer actions. Both are wired to placeholder handlers for now —
 * Razorpay checkout and the real enquiry endpoint land in Phase 4.
 *
 * A sold piece renders no actions at all: it can be neither bought nor
 * enquired on.
 */
export function ArtworkActions({
  artworkTitle,
  sold,
  priceOnRequest,
}: Props) {
  const [notice, setNotice] = useState<string | null>(null);

  if (sold) return null;

  return (
    <div className="pt-10">
      <div className="flex flex-wrap gap-3.5">
        {/* A price-on-request piece has no amount to charge, so it offers
            only the enquiry route. */}
        {priceOnRequest ? null : (
          <button
            type="button"
            onClick={() =>
              setNotice("Online payment opens in the next phase of the build.")
            }
            className="cursor-pointer border-none bg-brass px-[34px] py-[17px] font-mono text-label tracking-label text-ink uppercase transition-colors duration-200 hover:bg-cream"
          >
            Buy online
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            setNotice(
              `Enquiry form for “${artworkTitle}” opens in the next phase.`,
            )
          }
          className="cursor-pointer border border-cream/45 bg-transparent px-[34px] py-[17px] font-mono text-label tracking-label text-cream uppercase transition-colors duration-200 hover:border-cream hover:bg-cream/12"
        >
          Send an enquiry
        </button>
      </div>

      {notice ? (
        <p
          role="status"
          className="m-0 pt-5 font-mono text-label-sm tracking-rail text-slate uppercase"
        >
          {notice}
        </p>
      ) : null}
    </div>
  );
}

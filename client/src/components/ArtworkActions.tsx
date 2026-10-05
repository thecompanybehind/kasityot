"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EnquiryForm } from "@/components/EnquiryForm";

type Props = {
  artworkId: string;
  artworkTitle: string;
  sold: boolean;
  priceOnRequest: boolean;
};

/* RAZORPAY — online payment is switched off for now; a buyer places an order
   request instead and the owner follows up. Restore the commented blocks
   marked RAZORPAY here and in src/app/api/checkout/route.ts to bring it back.

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (e: unknown) => void) => void;
    };
  }
}
*/

const field =
  "w-full min-w-0 border border-brass/35 bg-transparent px-4 py-3 text-body text-bone outline-none transition-colors focus:border-brass";
const label =
  "block pb-2 font-mono text-label-sm tracking-rail text-slate uppercase";

/* RAZORPAY
// Razorpay's script is only pulled in when the buyer opens checkout.
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
*/

export function ArtworkActions({
  artworkId,
  artworkTitle,
  sold,
  priceOnRequest,
}: Props) {
  const router = useRouter();
  const [panel, setPanel] = useState<"none" | "buy" | "enquire">("none");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A sold piece can be neither bought nor enquired on.
  if (sold) return null;

  async function placeOrder(formData: FormData) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId,
          name: formData.get("name"),
          phone: formData.get("phone"),
          email: formData.get("email"),
          address: formData.get("address"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place your order.");

      router.push("/order/requested");

      /* RAZORPAY — restore in place of the router.push above.
      if (!(await loadRazorpay())) {
        throw new Error("Could not reach the payment window. Check your connection.");
      }

      const rzp = new window.Razorpay!({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Kasityot",
        image: `${window.location.origin}/logo-tile.png`,
        description: data.artworkTitle,
        prefill: {
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          contact: String(formData.get("phone") ?? ""),
        },
        theme: { color: "#c79e68" },
        handler: async (response: RazorpayResponse) => {
          // Never trust this callback alone — the server re-verifies the
          // signature before anything is marked paid.
          const verify = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          router.push(
            verify.ok
              ? `/order/success?payment=${response.razorpay_payment_id}`
              : `/order/failed?reason=verification`,
          );
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      });

      rzp.on("payment.failed", () => {
        router.push("/order/failed?reason=declined");
      });
      rzp.open();
      */
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="pt-10">
      {panel === "none" ? (
        <>
          <div className="flex flex-wrap gap-3.5">
            {/* A price-on-request piece has no amount to charge. */}
            {priceOnRequest ? null : (
              <button
                type="button"
                onClick={() => setPanel("buy")}
                className="cursor-pointer border-none bg-brass px-[34px] py-[17px] font-mono text-label tracking-label text-ink uppercase transition-colors duration-200 hover:bg-cream"
              >
                Order this piece
              </button>
            )}
            <button
              type="button"
              onClick={() => setPanel("enquire")}
              className="cursor-pointer border border-cream/45 bg-transparent px-[34px] py-[17px] font-mono text-label tracking-label text-cream uppercase transition-colors duration-200 hover:border-cream hover:bg-cream/12"
            >
              Send an enquiry
            </button>
          </div>
          {error ? (
            <p role="alert" className="m-0 pt-5 text-body-sm text-brass">
              {error}
            </p>
          ) : null}
        </>
      ) : null}

      {panel === "enquire" ? (
        <div className="border-t border-brass/30 pt-8">
          <h2 className="m-0 pb-6 font-display text-card-title text-cream">
            Enquire about this piece
          </h2>
          <EnquiryForm
            artworkId={artworkId}
            artworkTitle={artworkTitle}
            onClose={() => setPanel("none")}
          />
        </div>
      ) : null}

      {panel === "buy" ? (
        <div className="border-t border-brass/30 pt-8">
          <h2 className="m-0 pb-2 font-display text-card-title text-cream">
            Where should we send it?
          </h2>
          <p className="m-0 pb-6 text-body-sm leading-[1.7] text-bone-muted">
            Nothing is charged now. We will call you to confirm the order and
            arrange payment and delivery.
          </p>

          {error ? (
            <div
              role="alert"
              className="mb-5 border border-brass/45 px-4 py-3 text-body-sm text-brass"
            >
              {error}
            </div>
          ) : null}

          <form action={placeOrder} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="bu-name" className={label}>
                  Full name
                </label>
                <input id="bu-name" name="name" required autoComplete="name" className={field} />
              </div>
              <div>
                <label htmlFor="bu-phone" className={label}>
                  Phone
                </label>
                <input
                  id="bu-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  required
                  autoComplete="tel"
                  className={field}
                />
              </div>
            </div>
            <div>
              <label htmlFor="bu-email" className={label}>
                Email
              </label>
              <input
                id="bu-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={field}
              />
            </div>
            <div>
              <label htmlFor="bu-address" className={label}>
                Delivery address
              </label>
              <textarea
                id="bu-address"
                name="address"
                rows={3}
                required
                autoComplete="street-address"
                className={`${field} resize-y`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="submit"
                disabled={busy}
                className="cursor-pointer border-none bg-brass px-[34px] py-[17px] font-mono text-label tracking-label text-ink uppercase transition-colors hover:bg-cream disabled:cursor-wait disabled:opacity-60"
              >
                {busy ? "Placing order…" : "Place order request"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPanel("none");
                  setError(null);
                }}
                className="cursor-pointer font-mono text-label tracking-nav text-slate uppercase transition-colors hover:text-bone"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

import { formatPrice } from "@/lib/format";

/**
 * Owner notifications via Resend.
 *
 * Every function here is best-effort: a missing API key or a provider
 * outage must never lose a buyer's enquiry or fail a paid order. Failures
 * are logged and swallowed, because the record is already safe in the
 * database and visible in the admin inbox.
 */

const ENDPOINT = "https://api.resend.com/emails";

async function send(subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;
  const from = process.env.NOTIFY_FROM_EMAIL;

  if (!key || !to || !from) {
    console.info("[notify] email not configured; skipping:", subject);
    return;
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[notify] resend rejected:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[notify] send failed:", (err as Error).message);
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const shell = (rows: string, heading: string) => `
  <div style="font-family:system-ui,sans-serif;max-width:560px;color:#1a1613">
    <h2 style="font-weight:400;font-size:20px;margin:0 0 16px">${esc(heading)}</h2>
    <table style="border-collapse:collapse;width:100%">${rows}</table>
    <p style="font-size:13px;color:#6a6157;margin-top:24px">
      Open the owner panel to reply or update the status.
    </p>
  </div>`;

const row = (label: string, value: string) => `
  <tr>
    <td style="padding:8px 12px 8px 0;color:#6a6157;font-size:13px;white-space:nowrap;vertical-align:top">${esc(label)}</td>
    <td style="padding:8px 0;font-size:14px">${esc(value)}</td>
  </tr>`;

export async function notifyNewEnquiry(e: {
  name: string;
  phone: string;
  city: string;
  message: string;
  artworkTitle: string;
}): Promise<void> {
  await send(
    `New enquiry — ${e.artworkTitle}`,
    shell(
      row("Artwork", e.artworkTitle) +
        row("From", e.name) +
        row("Phone", e.phone) +
        row("City", e.city) +
        row("Message", e.message),
      "New enquiry",
    ),
  );
}

export async function notifyOrderRequest(o: {
  name: string;
  phone: string;
  email: string;
  address: string;
  amount: number;
  artworkTitle: string;
}): Promise<void> {
  await send(
    `New order request — ${o.artworkTitle}`,
    shell(
      row("Artwork", o.artworkTitle) +
        row("Amount", formatPrice(o.amount)) +
        row("Buyer", o.name) +
        row("Phone", o.phone) +
        row("Email", o.email) +
        row("Address", o.address) +
        row("Payment", "Not taken online — arrange with the buyer"),
      "New order request",
    ),
  );
}

export async function notifyPaidOrder(o: {
  name: string;
  phone: string;
  email: string;
  address: string;
  amount: number;
  artworkTitle: string;
  paymentId: string;
}): Promise<void> {
  await send(
    `Payment received — ${o.artworkTitle}`,
    shell(
      row("Artwork", o.artworkTitle) +
        row("Amount", formatPrice(o.amount)) +
        row("Buyer", o.name) +
        row("Phone", o.phone) +
        row("Email", o.email) +
        row("Address", o.address) +
        row("Razorpay payment", o.paymentId),
      "Payment received",
    ),
  );
}

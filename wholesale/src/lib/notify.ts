/**
 * Owner notifications via Resend, for new registrations and trade enquiries.
 *
 * Best-effort, like the shop's: the record is already safe in the database
 * and waiting in the owner panel, so a missing key or a provider outage costs
 * a heads-up, never a registration or an enquiry. Failures are logged and
 * swallowed.
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

const shell = (rows: string, heading: string, footer: string) => `
  <div style="font-family:system-ui,sans-serif;max-width:560px;color:#1a1613">
    <h2 style="font-weight:400;font-size:20px;margin:0 0 16px">${esc(heading)}</h2>
    <table style="border-collapse:collapse;width:100%">${rows}</table>
    <p style="font-size:13px;color:#6a6157;margin-top:24px">${esc(footer)}</p>
  </div>`;

const row = (label: string, value: string) => `
  <tr>
    <td style="padding:8px 12px 8px 0;color:#6a6157;font-size:13px;white-space:nowrap;vertical-align:top">${esc(label)}</td>
    <td style="padding:8px 0;font-size:14px">${esc(value)}</td>
  </tr>`;

export async function notifyNewWholesaler(w: {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  gstin: string;
  about: string;
}): Promise<void> {
  await send(
    `New wholesale registration — ${w.businessName}`,
    shell(
      row("Business", w.businessName) +
        row("Contact", w.contactName) +
        row("Email", w.email) +
        row("Phone", w.phone) +
        row("City", w.city) +
        row("GSTIN", w.gstin || "Not given") +
        row("About", w.about || "Not given"),
      "New wholesale registration",
      "They cannot see the catalogue until you approve them under Wholesale → Wholesalers in the owner panel.",
    ),
  );
}

export async function notifyNewTradeEnquiry(e: {
  businessName: string;
  contactName: string;
  email: string;
  productTitle: string;
  quantity: number | null;
  message: string;
}): Promise<void> {
  await send(
    `Trade enquiry — ${e.productTitle}`,
    shell(
      row("Product", e.productTitle) +
        row("Quantity", e.quantity ? `${e.quantity} units` : "Not given") +
        row("Business", e.businessName) +
        row("Contact", e.contactName) +
        row("Email", e.email) +
        row("Message", e.message),
      "New trade enquiry",
      "Open Wholesale → Enquiries in the owner panel to update its status.",
    ),
  );
}

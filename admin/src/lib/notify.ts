/**
 * Emails the owner panel sends to artists, via Resend.
 *
 * Unlike the public site's notify helper, these are NOT best-effort. That one
 * swallows failures because the record it is announcing is already safe in the
 * database and visible in the inbox. Here the email *is* the delivery: an
 * invite that never arrives leaves an artist waiting indefinitely for a link
 * they were told to expect. So every function reports whether it sent, and the
 * caller shows the link on screen either way.
 */

const ENDPOINT = "https://api.resend.com/emails";

export type SendResult = { sent: boolean; error?: string };

async function send(
  to: string,
  subject: string,
  html: string,
): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL;

  if (!key || !from) {
    return {
      sent: false,
      error: "Email is not configured, so nothing was sent.",
    };
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
      const body = await res.text();
      console.error("[notify] resend rejected:", res.status, body);
      return { sent: false, error: `The email provider refused it (${res.status}).` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[notify] send failed:", (err as Error).message);
    return { sent: false, error: "The email could not be sent." };
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const shell = (body: string) => `
  <div style="font-family:system-ui,sans-serif;max-width:560px;color:#1a1613;line-height:1.7">
    ${body}
    <p style="font-size:13px;color:#6a6157;margin-top:28px;border-top:1px solid #e4ded3;padding-top:16px">
      Kasityot — handmade in India
    </p>
  </div>`;

/**
 * The invite itself.
 *
 * The link is the whole point of the email, so it appears both as a button and
 * as plain text: mail clients that strip styling, and artists reading on a
 * phone that mangles the button, still get something they can use.
 */
export async function emailArtistInvite(opts: {
  to: string;
  name: string;
  inviteUrl: string;
}): Promise<SendResult> {
  return send(
    opts.to,
    "Welcome to Kasityot — set up your studio",
    shell(`
      <h2 style="font-weight:400;font-size:22px;margin:0 0 16px">
        ${esc(opts.name)}, we would like to work with you
      </h2>
      <p style="margin:0 0 20px">
        We have read your application and we would like to show your work.
        The link below sets up your studio, where you can send us photographs
        of pieces you would like listed.
      </p>
      <p style="margin:0 0 24px">
        <a href="${esc(opts.inviteUrl)}"
           style="display:inline-block;background:#1a1613;color:#f6f1e7;padding:14px 26px;text-decoration:none;font-size:14px;letter-spacing:0.08em;text-transform:uppercase">
          Set up your studio
        </a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:#6a6157">
        Or paste this into your browser:
      </p>
      <p style="margin:0 0 20px;font-size:13px;word-break:break-all">
        <a href="${esc(opts.inviteUrl)}" style="color:#8a6a35">${esc(opts.inviteUrl)}</a>
      </p>
      <p style="margin:0;font-size:13px;color:#6a6157">
        The link works once and lasts two weeks. If it expires, reply to this
        email and we will send another.
      </p>
    `),
  );
}

/**
 * A rejection, with the owner's reason.
 *
 * Sent because being left to wonder is worse than being told no — the reason
 * is required in the panel for the same purpose.
 */
export async function emailArtistRejection(opts: {
  to: string;
  name: string;
  reason: string;
}): Promise<SendResult> {
  return send(
    opts.to,
    "About your Kasityot application",
    shell(`
      <h2 style="font-weight:400;font-size:22px;margin:0 0 16px">
        Thank you for writing to us, ${esc(opts.name)}
      </h2>
      <p style="margin:0 0 20px">
        We have read your application carefully, and we are not able to take
        your work on at the moment. We would rather tell you why than leave it
        vague:
      </p>
      <blockquote style="margin:0 0 20px;padding:12px 18px;border-left:2px solid #8a6a35;background:#faf7f1">
        ${esc(opts.reason)}
      </blockquote>
      <p style="margin:0">
        This is not a judgement of your craft, and we are glad you wrote.
      </p>
    `),
  );
}

/** Told the moment a piece goes live, so the artist can see it on the site. */
export async function emailArtworkApproved(opts: {
  to: string;
  name: string;
  title: string;
  url?: string;
}): Promise<SendResult> {
  return send(
    opts.to,
    `“${opts.title}” is on the site`,
    shell(`
      <h2 style="font-weight:400;font-size:22px;margin:0 0 16px">
        ${esc(opts.title)} is live
      </h2>
      <p style="margin:0 0 20px">
        ${esc(opts.name)}, we have listed your piece. It is on the site now and
        buyers can enquire about it.
      </p>
      ${
        opts.url
          ? `<p style="margin:0 0 20px"><a href="${esc(opts.url)}" style="color:#8a6a35">See it on the site</a></p>`
          : ""
      }
      <p style="margin:0;font-size:13px;color:#6a6157">
        If you need anything changed, edit it in your studio — it comes back to
        us for a quick look before the change goes up.
      </p>
    `),
  );
}

/** Sent back for changes, with what needs doing. */
export async function emailArtworkRejected(opts: {
  to: string;
  name: string;
  title: string;
  reason: string;
}): Promise<SendResult> {
  return send(
    opts.to,
    `“${opts.title}” — a change before we list it`,
    shell(`
      <h2 style="font-weight:400;font-size:22px;margin:0 0 16px">
        One thing on ${esc(opts.title)}
      </h2>
      <p style="margin:0 0 20px">
        ${esc(opts.name)}, we would like to list this piece, but something needs
        changing first:
      </p>
      <blockquote style="margin:0 0 20px;padding:12px 18px;border-left:2px solid #8a6a35;background:#faf7f1">
        ${esc(opts.reason)}
      </blockquote>
      <p style="margin:0">
        Open it in your studio, make the change, and send it back to us.
      </p>
    `),
  );
}

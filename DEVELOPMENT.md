# Kasityot — developer notes

Four Next.js apps and one shared package, in an npm workspace.

```
kasityot/
  client/          the public shop            :3000   kasityot.com
  admin/           the owner panel            :3001
  artist/          the artist studio          :3002
  wholesale/       the wholesaler panel       :3003   wholesaler.kasityot.com
  packages/core/   Mongoose models + the Atlas connection
```

One MongoDB Atlas database behind all four. Cloudinary for images, Razorpay
for payments, Resend for email.

> `README.md` is the original build prompt, kept as a record of what was
> commissioned. It predates artist onboarding and says artist login is out of
> scope — that was true of the first four phases. This file describes what the
> repo actually is now.

## Getting started

```bash
npm install                      # from the repo root: installs all workspaces
cp client/.env.example client/.env.local
cp admin/.env.example  admin/.env.local
cp artist/.env.example artist/.env.local
cp wholesale/.env.example wholesale/.env.local
# fill in the values, then:
npm run dev --workspace client   # or admin, artist, wholesale
```

All four apps must point at the same `DATABASE_URL`.

**`WHOLESALE_SESSION_SECRET` must differ from both other secrets**, for the
same reason as below.

**`ARTIST_SESSION_SECRET` must not equal the owner panel's `SESSION_SECRET`.**
If they match, a token minted by the studio verifies inside the owner panel,
and only a `role` claim stands between an artist and the admin surface. Two
secrets make that forgery impossible rather than merely guarded against.

`admin` needs `NEXT_PUBLIC_ARTIST_URL` to build invite links that point at the
studio, and `NEXT_PUBLIC_WHOLESALE_URL` for the sign-in link in the email a
wholesaler gets when approved.

## The shared package

Every model lives once, in `packages/core`, and is imported as
`@kasityot/core`. They were previously duplicated per app; with three apps a
schema change would need applying three times and would drift silently when
one copy was missed — one app filtering on a status value another never wrote.

`mongoose` is a **peer** dependency there, so each app supplies the runtime
copy and only one model registry exists. It is also a dev dependency, without
which the package cannot resolve its own types — and that failure collapses
every model type to `any`, surfacing as implicit-any errors in unrelated files.

Each app lists `@kasityot/core` in `transpilePackages`, because it sits outside
the app root. Turbopack will not resolve it through a `file:` dependency and a
symlink, whether aliased in tsconfig or exposed via `exports` or `main`; the
workspace is what makes it work.

## The two approval gates

Nothing an artist does reaches the public site without the owner acting.

```
join form ──> applicationStatus: pending
                    │  owner approves ──> invite emailed (link also shown once)
                    ▼
              artist sets password, signs in
                    │
                    ▼
              submits a piece ──> reviewStatus: pending
                                        │  owner approves
                                        ▼
                                  live on the shop
```

### Why the new fields are separate from `status`

Both models already had a `status`, and neither could absorb review state:

- `Artist.status` (`visible | hidden`) is the **owner's display choice**. An
  approved artist may still be deliberately hidden.
- `Artwork.status` (`available | sold | hidden`) is **commercial state**. A
  piece can be approved and sold, or pending and available.

So `applicationStatus` and `reviewStatus` sit alongside them. Two orthogonal
axes, two fields.

### Pre-existing rows

Both new fields default to `"approved"`, because records the owner creates by
hand are approved by that act. But Mongoose applies a default **on write, not
on read**, so rows written before the fields existed have no value at all.

Two consequences, both handled:

1. `packages/core/scripts/backfill-status.ts` sets them. Run it before the
   public filters go live, or every existing record reads as unapproved and
   vanishes from the site. It only touches documents where the field is
   absent, so it is safe to re-run.
2. The public filters treat a missing value as approved, so a forgotten
   backfill cannot take the whole site dark.

```bash
npm run backfill --workspace @kasityot/core
```

### Where the gates are enforced

`client/src/lib/queries.ts` holds `PUBLIC_ARTIST` and `PUBLIC_ARTWORK`, spread
into every public read. **Adding a public read means adding the filter** —
omitting it leaks unreviewed work.

The checkout route and the enquiry action look artwork up by an id from the
request body, bypassing those helpers, so both call
`isArtworkPubliclyVisible`. Ids are guessable and neither endpoint is
authenticated. Both report "not found" rather than "not approved", which would
confirm the id exists to someone probing.

`checkout/verify` is deliberately **not** gated: it acts on an `Order` whose
creation was already checked, and refusing a genuine payment there would take
the buyer's money without marking the piece sold.

## Artist sessions

`artist/src/lib/auth.ts` mirrors the owner's auth with a different cookie and a
different secret. The JWT carries `artistId`, and every artwork query filters
on it **inside the query**:

```ts
const art = await Artwork.findOne({ _id: id, artistId: session.artistId });
```

Not fetch-then-compare. A missing ownership check then reads as "not found"
rather than silently allowing one artist to edit another's work.

`getArtistSession` re-reads approval from the database on every call, so an
artist rejected after signing in loses access at once rather than when their
two-week token expires. The Edge proxy only verifies the signature — it has no
database access — so that deeper check belongs on the page.

## Wholesale

Trade buyers get their own catalogue, with optional prices, on
`wholesaler.kasityot.com`. **Wholesale products and prices must never reach
the public shop**, and three things keep them out:

1. **Separate collections.** `WholesaleProduct`, `Wholesaler` and
   `WholesaleEnquiry` are not flags on `Artwork` or `Enquiry`, so no public
   query, however careless, can return one. Compare the review gate above,
   which relies on a filter that a forgotten spread would leak through.
2. **A separate entry point.** The models are exported from
   `@kasityot/core/wholesale`, not the main barrel, and
   `client/eslint.config.mjs` fails the lint on any import of it. Only
   `admin/` and `wholesale/` import it.
3. **A separate app on its own subdomain.** The shop has no wholesale code to
   bundle. The panel's session cookie has no `Domain`, so it stays on the
   subdomain, and the whole app is `noindex` with a `Disallow: /` robots.txt.

### Accounts

Wholesalers register themselves with a password, unlike artists, who are
invited, because there is nothing a wholesaler can publish. An account starts
`pending` and **sees no products or prices until the owner approves it** under
Wholesale → Wholesalers. A pending or rejected wholesaler can still sign in,
but only to see a status page (with the owner's reason, if refused).

The password hash sits on the `Wholesaler` document with `select: false`, so
no query returns it unless it asks by name; only `verifyWholesaler` does. Admin
views are built field by field as well.

`getWholesaler()` re-reads the status from the database on every request, so
approving opens the catalogue on the buyer's next click and revoking closes it
the same way. Every page that shows products checks `status === "approved"`
**in the page itself**, before any product query, never in a layout: Next
renders layouts and pages in parallel, so a layout check would not stop the
page's own reads.

Sign-in is rate limited per IP and per email; registration per IP; enquiries
per account. The same per-instance caveat applies as for the join form.

### Deploying the subdomain

`wholesale/` is its own Vercel project, like `artist/` will be:

1. New Vercel project from this repo, root directory `wholesale`.
2. Env vars from `wholesale/.env.example`: the shared `DATABASE_URL`, a fresh
   `WHOLESALE_SESSION_SECRET` (`openssl rand -base64 48`), and the Resend trio
   if owner emails are wanted.
3. Add the domain `wholesaler.kasityot.com` to that project, then at the DNS
   provider a `CNAME` from `wholesaler` to `cname.vercel-dns.com`.
4. Set `NEXT_PUBLIC_WHOLESALE_URL=https://wholesaler.kasityot.com` on the
   **admin** project and redeploy it.

## Motion and reduced-motion

The shop's entrances are CSS animations and transitions (`globals.css`),
started by `REVEAL_SCRIPT` in `client/src/components/ui/Reveal.tsx`, which runs
inline before first paint.

`prefers-reduced-motion: reduce` used to cut **every** animation to 0.01ms.
Windows reports that preference whenever *Settings → Accessibility → Visual
effects → Animation effects* is off, which many laptops ship with, and every
browser on the machine follows it, private windows included. On those
machines the site had no motion at all and looked broken. Now:

- **Removed under reduce:** movement only. Lines sliding up become fades in
  place; the banner's slow zoom, parallax and the scroll hairline are off; the
  banner does not auto-advance; scroll reveals that slide, grow or zoom fade
  instead.
- **Kept:** wipes, drawn rules and image covers lifting, which uncover without
  moving anything; the price count-up; the home preloader, as fades on a still
  loom with a shorter minimum.

A page loaded out of sight (a background tab, a prerender) used to play its
whole opening unseen. `data-wait` on `<html>` now pauses every animation until
the page is first visible, and the preloader's clock starts on its first frame.
The 12-second backstop only fires if the preloader component never mounts.

To test, toggle *Emulate CSS media feature prefers-reduced-motion* in Chrome
DevTools → Rendering, or switch the Windows setting above.

## Invites

Minted in `admin/src/lib/invite.ts`. 32 bytes of CSPRNG output; only the
SHA-256 hash is stored, so a read of the collection never yields a working
login. SHA-256 rather than bcrypt is deliberate: there is nothing to
brute-force in a random 32-byte token, so a slow hash buys nothing.

Fourteen-day expiry, single use. Issuing a new one overwrites the old hash, so
the previous link stops working. Credentials live in their own `ArtistUser`
collection rather than on `Artist`, because `Artist` documents are serialised
into view types and handed to client components throughout both other apps — a
password hash there would be one careless spread away from a browser.

## Email

`admin/src/lib/notify.ts`, via Resend. Unlike the public site's helper these
are **not** best-effort: that one swallows failures because the record it
announces is already safe in the database, but here the email *is* the
delivery. An invite that silently fails leaves an artist waiting for a link
they were told to expect. So `send()` reports whether it went out and the panel
shows either "emailed" or "the email did not go out — send this yourself".

**Resend is currently unconfigured.** `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` and
`OWNER_EMAIL` exist as empty strings, so the existing enquiry and order
notifications have also been skipping silently. Filling them in switches
emailing on with no code change; until then the panel falls back to copy-paste.

## Verification

```bash
npx tsc --noEmit    # in each of the five packages
npm run build       # in client, admin, artist, wholesale
npx eslint src      # in each app
```

The onboarding flow was verified against the database with a throwaway script
covering: the application gate, invite hashing and single use, password
verification, the submission gate, cross-artist isolation, publication on
approval, edit-sends-back-for-review, and access revocation on rejection.
Those scripts were not kept — there is no test harness in this repo, which is
the most obvious thing to add next.

## Known gaps

- **No automated tests.** Verification has been manual throughout.
- **Artist payouts.** Razorpay settles to one account; per-artist settlement
  needs KYC, bank details and a split ledger. Not started.
- **No self-serve password reset.** The owner issues a fresh invite instead,
  which needs email to be configured to be pleasant.
- **Rate limiting is per-instance and in-memory** (`rate-limit.ts`). On Vercel
  each serverless instance keeps its own map, so it stops casual spam, not a
  botnet. Move to Upstash Redis if abuse becomes real; the call sites do not
  change.
- **`artist/` has no deploy target yet.** It needs its own Vercel project or a
  subdomain, plus its own env vars.

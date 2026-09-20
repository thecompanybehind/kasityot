# Artist onboarding — implementation plan

Two owner-controlled gates:

```
artist fills /join  ->  owner approves      ->  artist sets password, logs in
                                            ->  artist submits artwork
                                            ->  owner approves artwork
                                            ->  artwork live on public site
```

Nothing reaches the public site without an explicit owner approval.

## Decisions taken

| Question | Decision |
|---|---|
| Where artist pages live | New third app, `artist/` |
| Artist login | Email + password (bcrypt + jose, same stack as owner) |
| Artist edits a live piece | Returns to `pending`, leaves the public site until re-approved |
| Scope | Plan, then build all of it |

---

## 1. Shared models package

**Why this comes first:** `admin/src/models/Artist.ts` and `client/src/models/Artist.ts`
are byte-identical today (verified by diff). Adding a third app makes three copies of
every schema. Every change in this plan touches `Artist` and `Artwork`, so without
this step each schema edit must be made three times, and drift is silent — one app
filtering on a status value another app does not write.

Create `packages/core/` holding the single copy of each model plus the DB helper:

```
packages/core/
  package.json          name: "@kasityot/core"
  src/
    db.ts               moved from <app>/src/lib/db.ts
    models/
      Artist.ts
      Artwork.ts
      ArtistUser.ts     new
      Enquiry.ts
      HeroSlide.ts
      Order.ts
    index.ts
```

Each app gets `"@kasityot/core": "file:../packages/core"` and a tsconfig path alias.
The existing `@/models/...` imports are rewritten to `@kasityot/core`. This is
mechanical — the schema bodies do not change in this step, only their location.

**If you would rather skip this:** the plan still works, but every schema change below
must be applied identically in `client/`, `admin/` and `artist/`. I would not recommend
it at three copies.

---

## 2. Schema changes

### 2.1 `Artist` — application lifecycle

The existing `status: visible | hidden` is a **display** flag the owner controls. It is
not an application state, and overloading it would conflate "approved but I have chosen
to hide them" with "not yet approved". So `status` stays exactly as it is, and a new
field is added alongside it:

```ts
applicationStatus: {
  type: String,
  enum: ["pending", "approved", "rejected"],
  default: "approved",   // see migration note
  index: true,
},

/** Login identity. Unique, lowercased. Null for owner-created artists. */
email: { type: String, default: null, unique: true, sparse: true, lowercase: true, trim: true },
phone: { type: String, default: null, trim: true },

/** Owner-only. Why a rejection happened; shown back to the artist. */
reviewNote: { type: String, default: "" },
reviewedAt: { type: Date, default: null },
```

**Migration note — this matters.** `default: "approved"` is deliberate. Existing artist
rows have no `applicationStatus`; Mongoose applies the default only on write, so a read
of an old row yields `undefined`, not `"approved"`. Two consequences:

1. A one-off script must backfill every existing artist to `approved`, or the public
   site will drop them all the moment the queries below start filtering on this field.
2. The public query must be written to treat missing-or-approved as approved, so the
   site does not go dark if the backfill is missed. See §4.

`unique: true` + `sparse: true` on `email` is required together: without `sparse`,
Mongo treats multiple `null` emails as duplicate keys and the second owner-created
artist fails to save.

### 2.2 `Artwork` — review lifecycle

Same reasoning. Existing `status: available | sold | hidden` is the **commercial**
state; it must not absorb review state. A piece can be `approved` + `sold`, or
`pending` + `available`. Two orthogonal axes, two fields:

```ts
reviewStatus: {
  type: String,
  enum: ["draft", "pending", "approved", "rejected"],
  default: "approved",   // same migration reasoning as Artist
  index: true,
},

/** Who created it. Null = owner-created directly in the panel. */
submittedByArtist: { type: Boolean, default: false },
submittedAt: { type: Date, default: null },
reviewNote: { type: String, default: "" },
reviewedAt: { type: Date, default: null },

/**
 * Set when an artist edits an already-approved piece. Lets the panel show
 * "was live, edited, awaiting re-approval" distinctly from a first submission.
 */
wasApproved: { type: Boolean, default: false },
```

`draft` exists so an artist can save a half-finished piece without it entering the
owner's queue. Only `pending` appears in the review queue.

### 2.3 `ArtistUser` — credentials

Kept separate from `Artist` rather than adding a password field to it. Reason: `Artist`
documents are serialised into `ArtistView` and passed to client components throughout
both existing apps. A password hash on that document is one careless spread away from
being sent to a browser. A separate collection means it cannot leak through an existing
code path.

```ts
{
  artistId:     { ObjectId, ref: "Artist", required, unique, index },
  email:        { String, required, unique, lowercase, trim, index },
  passwordHash: { String, default: null },   // null until invite is redeemed

  /** Single-use, hashed. Raw token goes in the invite link only. */
  inviteTokenHash: { String, default: null },
  inviteExpiresAt: { Date, default: null },

  lastLoginAt: { Date, default: null },
}
```

The invite token is stored hashed, never raw — a database read must not yield a working
login link.

---

## 3. The `artist/` app

Scaffolded from `admin/`'s config: same Next 16 / React 19 / Tailwind 4 / mongoose 9
versions, same `reactCompiler: true`, same Cloudinary `remotePatterns`.

```
artist/
  package.json
  next.config.ts
  .env.local.example
  src/
    app/
      layout.tsx
      join/page.tsx                 public — the onboarding form
      join/thanks/page.tsx          "we'll be in touch"
      login/page.tsx                public
      invite/[token]/page.tsx       public — set your password
      studio/page.tsx               auth — dashboard, application state
      studio/profile/page.tsx       auth — edit own profile
      studio/artworks/page.tsx      auth — own pieces + review state
      studio/artworks/new/page.tsx  auth — submit
      studio/artworks/[id]/page.tsx auth — edit (own only)
      api/logout/route.ts
      api/upload/route.ts           artist-session guarded
    components/
      StudioShell.tsx
      JoinForm.tsx
      ArtistArtworkForm.tsx
      ReviewBadge.tsx
    lib/
      auth.ts                       artist sessions
      actions.ts                    artist mutations
      queries.ts                    artist-scoped reads
```

### 3.1 Artist auth — `artist/src/lib/auth.ts`

Mirrors the owner's `auth.ts` (jose HS256, httpOnly cookie, bcrypt compare) with three
deliberate differences:

- **Different cookie name:** `kasityot_artist_session`, not `kasityot_session`.
- **Different signing secret:** `ARTIST_SESSION_SECRET`. If both apps signed with the
  same secret, an artist token would verify inside the admin app. The `role` claim
  would still have to be checked to stop it — a separate secret makes the
  cross-app forgery structurally impossible instead of relying on one `if`.
- **Payload carries `artistId`:** `{ artistId, email, role: "artist" }`. Every
  artist-scoped query filters on this, never on a form-supplied id.

```ts
export async function getArtistSession():
  Promise<{ artistId: string; email: string } | null>
```

Login additionally requires `applicationStatus === "approved"`. A pending or rejected
applicant cannot obtain a session at all, so no amount of URL guessing reaches `/studio`.

### 3.2 Ownership enforcement

Every artist action resolves the target through the session, not the request:

```ts
const session = await requireArtist();           // redirects to /login
const art = await Artwork.findOne({
  _id: id,
  artistId: session.artistId,                    // ownership in the query itself
});
if (!art) return { ok: false, error: "Not found." };
```

Filtering by `artistId` inside the query — rather than fetching then comparing — means
a missing ownership check reads as "not found" rather than silently allowing the edit.
Applies to every mutation in `artist/src/lib/actions.ts`.

### 3.3 Upload route

`artist/src/app/api/upload/route.ts` is a copy of the admin one with `getSession()`
swapped for `getArtistSession()`, same 10 MB cap and same MIME allowlist. It uploads to
a `kasityot/submissions` Cloudinary folder so unreviewed images are distinguishable
from owner-curated ones.

---

## 4. Public site gating — `client/`

This is the step that makes approval mean something, and the one most likely to break
the live site if done carelessly. Every public read in `client/src/lib/queries.ts` gains
an approval condition.

Because old rows lack the new fields (§2.1), the filter must accept missing values as
approved:

```ts
const APPROVED_ARTIST = {
  status: "visible",
  $or: [
    { applicationStatus: "approved" },
    { applicationStatus: { $exists: false } },   // pre-migration rows
  ],
};

const APPROVED_ARTWORK = {
  status: { $in: ["available", "sold"] },
  $or: [
    { reviewStatus: "approved" },
    { reviewStatus: { $exists: false } },
  ],
};
```

Functions to update — all of them, since missing one leaks unapproved work:

- `getArtists` — add artist condition
- `getArtistBySlug` — add artist condition
- `getArtworks` — both conditions (it already joins artists manually)
- `getArtworkBySlug` — both, including the existing artist re-check
- `getArtworksByArtist` — artwork condition
- `getFeaturedArtworks` — both
- `getFilterOptions` — artist condition, or rejected artists' craft types appear as
  filter options with zero results
- `client/src/app/sitemap.ts` — reuses the above; verify it does not query directly

Admin reads (`getAllArtworks`, `getAllArtists`) stay unfiltered by design.

---

## 5. Admin panel additions

```
admin/src/app/
  applications/page.tsx        artist queue: pending / approved / rejected
  applications/[id]/page.tsx   full application + approve / reject
  submissions/page.tsx         artwork queue, pending first
  submissions/[id]/page.tsx    review one piece + approve / reject
```

New actions in `admin/src/lib/actions.ts`, each `await requireOwner()` first, matching
the existing file's convention:

```ts
approveArtistApplication(id)          // -> approved, generates invite, revalidates
rejectArtistApplication(id, note)     // -> rejected + note
approveArtwork(id)                    // -> approved, clears wasApproved
rejectArtwork(id, note)               // -> rejected + note
resendArtistInvite(id)                // fresh token, old hash overwritten
```

`approveArtistApplication` generates the invite: random token, store the hash, return
the raw link once for the owner to copy. With no email provider wired up (§7), the
owner passes it on by WhatsApp — which matches how they already work.

Additions to `AdminShell.tsx` nav and the dashboard: pending counts for both queues,
since an unnoticed queue is the main failure mode of this design.

---

## 6. Re-approval on edit

Per the decision taken. In the artist's save action:

```ts
if (existing.reviewStatus === "approved") {
  data.wasApproved = true;
  data.reviewStatus = "pending";       // leaves the public site immediately
  data.submittedAt = new Date();
}
```

The studio UI must state this plainly before the artist saves — *"This piece is live.
Saving changes takes it off the site until it is approved again."* Otherwise an artist
fixing a typo silently unpublishes their own work and will report it as a bug.

Owner-side edits in the admin panel do **not** trigger this. The owner approving is
implicit in the owner editing.

---

## 7. Deliberately out of scope

Flagging these so they are decisions, not omissions:

- **Transactional email.** No provider is configured in this repo. Invite links and
  approval notifications are copy-paste for the owner. Wiring Resend/SES is a
  self-contained follow-up; `client/src/lib/notify.ts` exists and may already offer a
  hook worth reusing.
- **Artist payouts / KYC.** Razorpay checkout currently settles to one account.
  Per-artist settlement is a much larger piece of work (bank details, split payments,
  ledger) and is not required for the flow you described.
- **Artist password reset.** Owner re-issues an invite via `resendArtistInvite`.
  Self-serve reset needs email.
- **Artist-set pricing trust.** An artist submits a price; the owner can edit it on
  review. No separate negotiation flow.

---

## 8. Build order

Each step leaves the repo working, so it can be stopped between steps.

| # | Step | Risk |
|---|---|---|
| 1 | `packages/core`, rewrite imports in both apps | Low — mechanical, but touches many files |
| 2 | Schema changes + backfill script | **Highest** — run backfill before step 3 |
| 3 | Public query gating in `client/` | High — a missed function leaks unapproved work |
| 4 | Admin queues + approve/reject actions | Low — additive |
| 5 | Scaffold `artist/` + auth + `/join` + invite | Medium — new auth surface |
| 6 | Artist studio: submit / edit artwork | Medium |
| 7 | Re-approval on edit + studio warnings | Low |
| 8 | End-to-end pass on the full flow | — |

## 9. Verification

Manual pass, in order:

1. Existing artists and artworks still appear on the public site after step 2's backfill.
2. `/join` submission creates a `pending` artist, invisible on the public site.
3. A pending applicant cannot log in or reach `/studio`.
4. Approve -> invite link -> set password -> `/studio` loads.
5. Submit artwork -> absent from the public site, present in the owner's queue.
6. Approve -> appears on the public site.
7. Artist edits the live piece -> it leaves the public site, returns to the queue.
8. Artist B cannot open or edit Artist A's artwork by id in the URL.
9. An artist session cookie does not grant access to the admin panel.
10. Reject -> artist sees the rejection note in the studio.

## 10. Open questions

1. **Who sets the price** on a submitted piece — artist proposes, or owner fills it in
   at review? The plan assumes artist proposes, owner may edit.
2. **Can an artist delete** their own unapproved submission? Plan assumes yes for
   `draft`/`rejected`, no once approved.
3. **Rejected application** — can the same email reapply, or is it blocked? Plan assumes
   the owner can flip it back to `pending` from the panel.
4. **`artist/` deploy target** — same Vercel project as a separate domain, or its own?
   Affects env var setup only.

---

# Built — outcome

All eight steps are done and committed. What changed from the plan as written:

1. **npm workspaces, not a `file:` dependency.** Turbopack would not resolve
   `@kasityot/core` through a symlink outside the app root, however it was
   declared. A real workspace is the supported arrangement.
2. **Emails are wired.** The plan had invites as copy-paste because email
   looked unconfigured. It is wired now — but Resend genuinely is not
   configured (the three env vars exist as empty strings), so the panel falls
   back to showing the link and saying the email did not go out. Filling the
   key in needs no code change.
3. **`proposedPrice` added to `Artwork`.** The artist proposes and the owner
   may re-price; without this the original ask would be erased.
4. **Two extra guards found while building.** `POST /api/checkout` and the
   enquiry action both looked artwork up by a raw id with no review check, so
   an unapproved piece could have been bought or enquired about directly.
   Both now call `isArtworkPubliclyVisible`.

Verified against the live database: 6 artists and 19 artworks intact
throughout, seventeen end-to-end checks passing, all three apps building and
linting clean.

Developer documentation is in `DEVELOPMENT.md`; the owner's guide is sections
8–10 of `HANDOVER.md`. Open questions 2–4 in §10 were resolved as the plan
assumed. Question 1 was answered by you: the artist proposes a price and the
owner may change it.

# Claude Code Prompt — Kasityot Handicraft Marketplace

Paste the block below into Claude Code at the root of an empty repo.

---

Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
https://claude.ai/design/p/7b76872a-40dc-4c38-9206-8d00b78e308d?file=Kasityot+Landing+v2.dc.html

Focus on these files (the whole project is readable):
- `Kasityot Landing v2.dc.html`

Also read these files the selection imports:
- `support.js`

Implement: `Kasityot Landing v2.dc.html`

---

## Context
 
Kasityot is a handicraft marketplace for a client in India. Artists make one-of-a-kind handmade pieces. The site shows the artwork and the artist behind it. A buyer can either pay online or send an enquiry. Every enquiry and order lands in a single admin panel that only the owner uses. The owner then contacts the artist and settles delivery offline.

There is **no artist login in this version**. Artists never see the panel. The owner adds artists and artwork himself.

The imported design file is the approved visual direction. Treat it as the source of truth for layout, type, colour, spacing and motion. Do not redesign it. Every page you build later must look like it came from the same design system.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL via Prisma (Supabase or Neon, your call — put the connection string in `DATABASE_URL`)
- Image and video storage: Supabase Storage (fall back to Cloudinary if simpler)
- Admin auth: a single owner account, credentials-based, session cookie. No public signup route anywhere in the app.
- Payments: Razorpay
- Deploy target: Vercel, on the client's existing domain 

If you want to swap any of these, ask first and give one reason. Do not swap silently.

## Data model (starting point, refine if needed)

- **Artist** — name, slug, photo, craft type, region, short story, video URL (nullable), status (visible/hidden)
- **Artwork** — title, slug, artistId, description, price (nullable), priceOnRequest (bool), material, dimensions, images (ordered), status (available/sold/hidden), featured (bool)
- **Enquiry** — artworkId, buyer name, phone, city, message, status (new/contacted/closed), ownerNotes, createdAt
- **Order** — artworkId, buyer name, phone, email, address, amount, razorpayOrderId, razorpayPaymentId, status (created/paid/failed), createdAt

Artwork is one-of-a-kind, so **many enquiries can exist against the same artwork**. Never collapse them to one. Never auto-close older ones.

## Rules for the whole build

1. Build in the four phases below, in order. Stop at the end of each phase, summarise what you did, and wait for me to say continue.
2. Do not add features that are not listed. If something feels missing, say so and wait.
3. Where the design file does not cover a page, extend the same design system rather than inventing a new look.
4. Never commit secrets. All keys in `.env.local`, with a committed `.env.example`.
5. Mobile first. Everything must work on a phone, not just a laptop.
6. Write seed data so every screen can be viewed with realistic content from day one.

## Explicitly out of scope — do not build

- Artist login, artist self-registration, artist dashboards
- Any approval or verification workflow for artists or artwork
- Order management beyond recording a paid order: no invoices, no shipping, no tracking, no artist payouts
- Mobile app
- Blog, newsletter, reviews, wishlist, multi-currency, multi-language
- Cart or multi-item checkout. One artwork, one purchase.

---

## Phase 1 — Design system and home page

**Goal:** the approved design running as a real Next.js page, pixel-faithful and responsive.

- Import the design project via the MCP and read every file in it.
- Scaffold the Next.js + TypeScript + Tailwind project.
- Extract the design into tokens: colour variables, type scale, font families and weights, spacing scale, radii, shadows, transition timings. Put them in the Tailwind config, not scattered inline.
- Build the shared shell: header, navigation, footer, mobile menu.
- Build reusable components the rest of the site will need: artwork card, artist card, section heading, primary and secondary buttons, image with graceful loading state.
- Build the home page exactly as designed, with content coming from hardcoded fixtures for now (no database yet).
- Test at 360px, 768px, 1280px and 1920px.

**Done when:** the home page matches the design at all four widths, no layout shift, no horizontal scroll, and every colour and font comes from a token rather than a hardcoded value.

---

## Phase 2 — Public site and data layer

**Goal:** the full public site, driven by the database.

- Set up Prisma with the schema above, run migrations, write seed data: at least 6 artists and 20 artworks, with two artists deliberately having no video.
- **Artwork listing page** — grid of artworks, filters by craft type, artist, and price range, plus a sort. Sold pieces stay visible but are clearly marked sold and cannot be bought or enquired on.
- **Artwork detail page** — image gallery, title, price or "Price on request", description, material, dimensions, and the artist block linking to the artist's profile. Two actions: buy online, or send an enquiry. Wire the buttons to placeholder handlers for now.
- **Artists directory** — all visible artists in a grid, filterable by craft type and region.
- **Artist profile page** — photo, story, craft type, region, video, and all their artwork. **If the artist has no video, the video block must not render at all and the layout must reflow with no gap.** This is a hard requirement from the client, not a nice to have. Same rule for any optional field.
- **About** and **Contact** pages in the same design language.
- Sensible empty states everywhere: no artworks yet, no artists yet, filters returning nothing.

**Done when:** every page reads from the database, the no-video artists show zero dead space, and filters work on mobile.

---

## Phase 3 — Admin panel

**Goal:** the owner can run the whole site without touching code.

- Owner login at `/admin`, credentials-based, session protected. No signup route. Middleware guards every admin path.
- **Dashboard** — counts of artworks, artists, new enquiries, paid orders, and the five most recent enquiries.
- **Artwork management** — list with search and filter, create, edit, delete. Multi-image upload with reordering and a chosen cover image. Set price or mark price on request. Toggle available / sold / hidden. Marking sold must immediately stop new enquiries and purchases on the public page.
- **Artist management** — create, edit, delete. Photo upload, video upload or URL, story, craft type, region. Hide an artist without deleting them.
- **Enquiry inbox** — every enquiry with buyer name, phone, city, message, the artwork it came from, and time received. Status toggle: new / contacted / closed. A free-text notes field per enquiry the owner can save. Filter by status and by artwork. Multiple enquiries on the same artwork all appear separately.
- Admin UI follows the same design system. It should not look like a generic dashboard template.

**Done when:** a non-technical person can add an artist, add an artwork with five photos, mark one sold, and work through the enquiry inbox without help.

---

## Phase 4 — Payments, enquiries and launch

**Goal:** money can move, enquiries arrive, site goes live.

- **Razorpay integration** — order created server side, checkout on the artwork page, signature verified on the server, success and failure both handled with a proper result page. Paid orders written to the Order table and visible in the admin panel. Keys live in env vars and belong to the client's own Razorpay account.
- On successful payment, mark the artwork sold automatically and stop further purchases on it.
- **Enquiry form** — name, phone, city, message. Server-side validation. Rate limit by IP and add a honeypot field. No login needed to enquire. Never expose enquiries to anyone but the owner.
- Notify the owner on new enquiry and new paid order. Email is fine; if a WhatsApp or Telegram webhook is trivial to add, propose it before building it.
- **SEO and meta** — per-page titles and descriptions, Open Graph images for artwork and artist pages, `sitemap.xml`, `robots.txt`, structured data for products.
- **Performance** — optimised images, lazy loading below the fold, Lighthouse above 90 on mobile for performance and accessibility.
- Full pass on a real phone. Check payment flow, enquiry flow, and every admin action.
- Deploy to Vercel, connect the client's existing domain, set all production env vars.
- Write a short `HANDOVER.md` in plain English: how to log in, how to add an artist, how to add artwork, how to mark sold, how to read the enquiry inbox, and where the Razorpay dashboard is.

**Done when:** a real payment goes through end to end on the live domain, the order shows in the panel, and the handover doc is written for someone who has never used a CMS.

---

Start with Phase 1. Import the design first and tell me what you found in it before you write any code.

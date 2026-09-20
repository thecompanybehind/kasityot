# Running the Kasityot website

This guide is for whoever looks after the site day to day. It assumes no
technical background. Nothing here can break the site permanently — if
something looks wrong, stop and call your developer.

There are two web addresses:

- **The shop** — what your customers see.
- **The owner panel** — where you add artwork, add artists, and read
  enquiries. Only you can open this.

---

## 1. Signing in

1. Go to the owner panel address.
2. Enter your email and password.
3. Press **Sign in**.

You stay signed in for 8 hours, then it asks again. Use **Sign out** in the
top right when you are on a shared computer.

**There is no "forgot password" link and no way to create a second
account.** This is deliberate — it means nobody else can ever sign up. If
you lose the password, your developer has to set a new one for you.

---

## 2. Adding an artist

Do this **before** adding their artwork — every piece has to belong to
someone.

1. Click **Artists** in the top menu.
2. Click **Add artist**.
3. Fill in:
   - **Name** — as it should appear on the website.
   - **Craft** — for example "Madhubani Painting". Customers filter by this,
     so keep the spelling the same each time.
   - **Region** — for example "Madhubani, Bihar".
   - **Story** — a few sentences about them and how they work. This is the
     main text on their page, so it is worth taking time over.
   - **Photograph** — optional. Click **Choose file** and pick a photo.
     Wait for it to appear before saving.
   - **Video URL** — optional. See the note below.
   - **Status** — leave as **Visible**.
4. Click **Add artist**.

### About the video

If you leave the video box empty, the artist's page simply has no video
section — no empty box, no gap. That is intended, so never feel you must
put something there.

To add one, upload the video to YouTube first, then copy the **embed**
link. It looks like `https://www.youtube.com/embed/XXXXXXX`. A normal
YouTube watch link will not work.

---

## 3. Adding artwork

1. Click **Artworks**, then **Add artwork**.
2. Fill in:
   - **Title** — the name of the piece.
   - **Artist** — pick from the list.
   - **Description** — what it is, how it was made, anything a buyer would
     want to know.
   - **Material** and **Dimensions**.
   - **Price** — in whole rupees, no commas or symbols. Type `18500`, not
     `₹18,500`.
   - **Price on request** — tick this instead of entering a price when the
     price is to be discussed. The customer then only sees an enquiry
     button, not a buy button.
3. **Photographs** — click **Choose file**. You can select several at once.
   Wait for each to appear.
   - The first photo is the **cover** — the one shown in listings.
   - Use **←** and **→** to change the order.
   - Use **Cover** on any photo to move it to the front.
   - Use **✕** to remove one.
4. **Status** — leave as **Available**.
5. Tick **Feature on the home page** if you want it on the front page.
6. Click **Add artwork**.

---

## 4. Marking something sold

When a piece sells — whether online or in person:

1. Go to **Artworks**.
2. Find the piece. Use the search box if the list is long.
3. Click **sold** on its row.

That is all. Straight away, on the public site:

- The piece stays visible, marked **Sold**.
- The Buy and Enquire buttons disappear, so nobody can pay for it or ask
  about it again.

Click **unsell** if you ever need to put it back on sale.

**Pieces bought and paid for online are marked sold automatically.** You do
not need to do anything.

### Hidden vs sold

- **Sold** — it stays on the site, clearly marked. Use this for work that
  has found a buyer.
- **Hidden** — it vanishes from the site entirely. Use this for a piece
  that is not ready yet, or photos you are not happy with.

---

## 5. Reading the enquiry inbox

Click **Enquiries**. Each enquiry is one card showing who wrote, their
phone number, their city, their message, and which artwork they were
looking at.

**If two people ask about the same piece, you see two separate cards.**
They are never merged, and an older one is never closed for you.

For each enquiry:

- Tap the phone number to call them straight from your phone.
- Set it to **new**, **contacted** or **closed** as you work through them.
- Type in **Private notes** and press **Save note**. Only you ever see
  these — the customer cannot.

Filter by status or by artwork using the two dropdown boxes at the top.

---

## 6. Changing the home page banner

The big photograph at the top of the home page.

1. Click **Banner**.
2. Click **Add banner**, choose a wide photograph, and save.

If you add more than one, they rotate automatically every 5 seconds and
visitors can tap the dots to move between them. With one banner, it stays
put.

The wording is optional. Leave the text boxes empty and the banner uses the
site's normal wording. Fill one in and it uses yours.

Use ↑ and ↓ to reorder them, **Hide** to take one off the site without
deleting it.

---

## 7. Money and payments

Payments are handled by **Razorpay**, using your own Razorpay account. The
money goes directly to you — the website never holds it.

**Your Razorpay dashboard is at [dashboard.razorpay.com](https://dashboard.razorpay.com).**
Sign in there to see settlements, issue refunds, and check when money
reaches your bank. That is the only place refunds can be issued — the owner
panel cannot do it.

When somebody pays online:

1. The piece is marked sold automatically.
2. The order appears in your **Paid orders** count on the dashboard.
3. You get an email with their name, phone, address and what they bought.
4. **You then contact them and arrange delivery yourself.** The website
   does not handle shipping or tracking.

---

## 8. Things worth knowing

**Changes can take up to a minute to show.** The home page refreshes itself
about once a minute. If you have just changed something and do not see it,
wait a moment and reload.

**Deleting is permanent.** There is no undo and no rubbish bin.

- Deleting an **artwork** also deletes every enquiry about it.
- An **artist** cannot be deleted while they still have artwork. Delete or
  move their pieces first — or better, just **Hide** them.

Hiding is almost always the safer choice.

**Photographs should be large.** Aim for at least 2000 pixels across. The
site shrinks big images automatically, but it cannot rescue a small blurry
one. Banner photos should be wide and landscape.

**Everything works on a phone**, including adding artwork and uploading
photos.

---

## 9. If something goes wrong

| What you see | What to do |
|---|---|
| Cannot sign in | Check the email and password. After too many wrong tries, wait a few minutes. |
| Photo will not upload | Check it is a JPEG or PNG under 10 MB, and that you are online. |
| "Online payment is not configured" | The Razorpay keys are not set. Your developer needs to add them. |
| A customer says they paid but nothing arrived | Check your Razorpay dashboard first — it is the record of what actually happened. Never mark the piece sold and unsold repeatedly. |
| Site is down entirely | Contact your developer. Do not change anything. |

**Never share your password**, and never let anyone else sign in as you —
the panel has no way to tell two people apart.

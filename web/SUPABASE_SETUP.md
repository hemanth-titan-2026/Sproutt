# Sproutt — Supabase setup

Everything is written and the app builds. What's left is connecting it to your
Supabase project. Roughly 15 minutes.

---

## 1. Environment variables

Open `web/.env.local` (already created, currently blank) and fill it in from
**Supabase Dashboard → your project → Project Settings → API Keys**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # or the "anon" key
SUPABASE_SECRET_KEY=sb_secret_...                          # or "service_role"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- The **publishable/anon** key is meant to be public. Row Level Security is what
  protects the data, not key secrecy.
- The **secret/service_role** key bypasses RLS entirely. It stays server-side —
  never prefix it with `NEXT_PUBLIC_`, never paste it into a chat or a commit.

Restart `npm run dev` after editing — Next only reads env files at boot.

---

## 2. Run the schema

Supabase Dashboard → **SQL Editor** → New query → paste all of
`web/supabase/migrations/0001_sproutt_init.sql` → **Run**.

It's written to be safely re-runnable, so a second run is harmless.

This creates:

| Table | What it holds |
|---|---|
| `profiles` | One row per user. Name, avatar, `trees_contributed`. |
| `products` | Your catalogue. **`trees_per_unit`** is the per-product tree count. |
| `orders` | One per purchase, with a `status` and a `trees_total`. |
| `order_items` | Line items, with price and tree count snapshotted at purchase. |
| `site_stats` | `baseline_trees` — see the note in step 6. |

Plus two functions the app calls: `global_trees_planted()` (the public counter)
and `my_impact()` (the signed-in user's numbers).

---

## 3. Auth settings

Dashboard → **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (swap for your real domain in production)
- **Redirect URLs** — add both:
  - `http://localhost:3000/**`
  - `https://yourdomain.com/**` (once you deploy)

If a redirect URL isn't listed here, Supabase silently rewrites email links back
to the Site URL and the reset flow appears to "do nothing".

Dashboard → **Authentication → Policies / Passwords**, turn on:

- **Confirm email** — so a signup isn't usable until the address is verified.
- **Leaked password protection** — rejects passwords found in breach corpora.
  This is a real upgrade over the length/complexity rules alone, and it's free.

---

## 4. Google sign-in

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services →
   **Credentials** → Create Credentials → **OAuth client ID** → *Web application*.
2. Under **Authorised redirect URIs**, add the callback Supabase shows you on its
   Google provider page. It looks like:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Copy the **Client ID** and **Client secret**.
4. Supabase Dashboard → **Authentication → Sign In / Providers → Google** →
   enable, paste both, save.

Note: you do *not* add `localhost:3000/auth/callback` to Google. Google talks to
Supabase; Supabase talks to your app.

---

## 5. Try it

```bash
cd web
npm run dev
```

- `/signup` — create an account, confirm via the emailed link
- `/login` — sign in, including "Continue with Google"
- `/forgot-password` → email → `/reset-password`
- The nav's top-right corner now shows your avatar and tree count
- `/account` — your full contribution breakdown

**Free-tier email caveat:** Supabase's built-in SMTP is rate-limited to a
handful of messages per hour and often lands in spam. It's fine for testing. For
real users, configure your own SMTP under **Authentication → Emails → SMTP
Settings** (Resend, Postmark, SendGrid all work).

---

## 6. Seeing the tree counter move

You have no checkout yet, so no order can reach `paid` on its own. To watch the
whole chain work, run this in the SQL editor with your own email:

```sql
-- 1. create a pending order for yourself
with me as (select id from auth.users where email = 'you@example.com'),
     o as (
       insert into public.orders (user_id, status)
       select id, 'pending' from me
       returning id
     )
insert into public.order_items (order_id, product_id, quantity)
select o.id, p.id, 2
from o, public.products p
where p.slug = 'seed-kit';   -- 10 trees per unit x 2 = 20 trees

-- 2. mark it paid — this is what mints the trees
update public.orders
set status = 'paid'
where user_id = (select id from auth.users where email = 'you@example.com')
  and status = 'pending';

-- 3. confirm
select trees_contributed from public.profiles
where id = (select id from auth.users where email = 'you@example.com');
```

Refresh the site — the nav badge and `/account` both show 20 trees.

**About `baseline_trees`:** the landing counter was previously hardcoded to
12,458. Rather than have it drop to 0, that number now lives in
`site_stats.baseline_trees` and the public counter shows *baseline + trees from
real paid orders*. If that 12,458 was a placeholder rather than trees actually
funded, set it to the real figure (or 0):

```sql
update public.site_stats set baseline_trees = 0;
```

---

## 7. Checkout, as it works today

There's no payment provider yet — that's a deliberate choice, not an oversight.
`SPROUTT_ALLOW_TEST_CHECKOUT=true` in `.env.local` makes **Buy now** create the
order and mark it paid straight away, which credits the trees.

If that variable isn't set, orders are still created but stay unpaid and
contribute nothing — so it must be set wherever you deploy, or the shop will
look broken.

**The trade-off, stated plainly:** orders complete without payment, so anyone
can click Buy repeatedly and add trees to the public counter for free. That's
fine for a demo or a portfolio piece. It is not fine for a shop taking real
money, and the counter on the landing page is a public claim.

## 8. When you add a payment provider

The one rule that matters: **only trusted server code may set an order to
`paid`.** There is deliberately no RLS update policy on `orders`, so a signed-in
user cannot flip their own order and mint themselves trees. Your payment webhook
should use `createAdminClient()` from `@/lib/supabase/admin`:

```ts
// e.g. src/app/api/webhooks/payment/route.ts — AFTER verifying the
// provider's signature, never before.
const admin = createAdminClient();
await admin.from("orders").update({ status: "paid" }).eq("id", orderId);
```

The database does the rest: triggers recalculate the order's `trees_total`, then
the user's `profiles.trees_contributed`, and the counters update.

To change how many trees a product funds, just edit the row — future orders pick
it up automatically, and past orders keep the count they were bought at:

```sql
update public.products set trees_per_unit = 12 where slug = 'seed-kit';
```

---

## Security notes

Choices worth knowing about, in case you revisit them:

- **`getUser()` not `getSession()`** on the server. `getSession()` trusts the
  cookie as-is; `getUser()` revalidates it with Supabase, so a forged cookie
  can't impersonate anyone.
- **`proxy.ts` redirects are UX, not security.** Every protected page
  re-checks the user itself, and RLS guards the data regardless.
- **Login and password-reset errors are deliberately vague** ("Incorrect email
  or password", "if an account exists…"). Specific messages would let anyone
  use the form to discover which emails have accounts.
- **`trees_contributed` is not client-writable.** RLS is row-level only, so a
  column grant (`grant update (full_name, avatar_url)`) is what stops a user
  PATCHing their own tree count.
- **Prices and tree counts are snapshotted server-side** by a trigger, from the
  `products` table — the client's numbers are ignored, so a crafted request
  can't buy a 10,000-tree item.

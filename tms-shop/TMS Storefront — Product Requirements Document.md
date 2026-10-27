# TMS Storefront: Product Requirements Document

**Version** 1.0 · **Date** 24 Oct 2026 · **Owner** Manny · **Audience** AI coding agents and developers building the production release

## 1. Summary

TMS (The Merch Shop) is a Nigerian custom merch production brand serving brands, events and communities. This product is its web storefront. A buyer browses pieces by category, sets quantities, briefs the design, and pays in naira (card or bank transfer) or on Solana (USDC or SOL). The owner sees every order and buyer record in an admin area.

**Current state.** A static prototype exists (`tms-shop` repo: `index.html` plus `assets/`). The cart lives in memory and payments are mocked. This PRD defines the production build that replaces it.

**Goals**

1. A live, reliable order loop: browse, cart, checkout, pay, confirmation, admin sees the order.
2. Accept naira and Solana stablecoin payments with server-verified confirmation.
3. The owner holds the buyer database and can export it.
4. Low running cost, small codebase, easy to maintain solo.
5. Data model that can grow to multiple designers later without a rewrite.

**Non-goals for v1:** buyer accounts, reviews, announcements, vendor self-service, multi-currency price lists, inventory counts, shipping carrier integrations.

## 2. Users and roles

| Role | Description | Auth |
| --- | --- | --- |
| Buyer | Anyone ordering merch. Guest checkout only in v1. | None. Order status via unguessable link. |
| Admin | TMS owner and staff. Manages products, orders, settings. | Supabase Auth, email plus password (magic link optional), `app_metadata.role = 'admin'`. |
| Vendor (future) | Designer posting own designs. | Out of scope. Schema keeps room for `vendor_id`. |

## 3. Scope by phase

| Phase | Included |
| --- | --- |
| **MVP (this PRD)** | Landing, catalog with categories, cart, guest checkout, Paystack (card and bank transfer), Solana Pay (USDC, SOL), order confirmation page, design-brief file upload, admin (orders, products, settings), transactional email. |
| Phase 2 | Reviews and design feedback, announcements and drops, admin-managed categories UI, order status emails, CSV export, discount codes. |
| Phase 3 | Multi-designer marketplace, buyer accounts, delivery zones and carriers, deposits and split payments. |

## 4. Tech stack (decided)

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js (App Router) + TypeScript | Server components for catalog, route handlers for APIs. |
| Styling | Tailwind CSS with CSS variables for tokens | Tokens in section 11. |
| Database | Supabase Postgres | Row Level Security on every table. |
| Admin auth | Supabase Auth | Role in `app_metadata`, never in user-editable metadata. |
| File storage | Supabase Storage | Private bucket for design briefs, public bucket for product images. |
| Naira payments | Paystack | Channels: card, bank transfer. |
| Solana payments | `@solana/pay`, `@solana/web3.js`, `@solana/spl-token` | RPC URL from a provider via env var. |
| Email | Resend (or equivalent) | Order confirmation to buyer, new-order alert to admin. |
| Validation | Zod | Every route handler input. |
| Hosting | Vercel | Static assets and images via `next/image`. |
| Tests | Vitest (unit), Playwright (e2e) | Money math and payment verification must be unit tested. |

**Global rules**

- Money is stored as integer **kobo** (1 NGN = 100 kobo). Never floats.
- The browser is untrusted. Totals are always recomputed server-side from database prices.
- Secrets (service role key, Paystack secret, webhook secrets) are server-only. Never prefix with `NEXT_PUBLIC_`.

## 5. Information architecture

| Route | Purpose |
| --- | --- |
| `/` | Landing (hero, about, process) plus shop section with category tabs. |
| `/checkout` | Delivery details, brief, payment method, pay. Redirects to `/` if cart empty. |
| `/order/[token]` | Order status page, keyed by `orders.public_token`. Handles payment return and Solana waiting state. |
| `/admin/login` | Admin sign-in. |
| `/admin/orders`, `/admin/orders/[id]` | List, filter, view buyer details, change status, recheck payment. |
| `/admin/products` | CRUD products and categories, image upload. |
| `/admin/settings` | Delivery fee, merchant wallet, USDC rate, support contact. |
| `/api/checkout` | Create order and start payment. |
| `/api/paystack/webhook` | Paystack event receiver. |
| `/api/solana/status` | Poll and verify a Solana payment. |
| `/api/uploads/sign` | Signed upload URL for brief files. |

The cart is a drawer, not a route. Cart state persists in `localStorage` (guarded with try/catch) and is validated against the server at checkout.

## 6. Core user flow

1. Buyer lands on `/`, reads about TMS, presses Shop the collection.
2. Picks a category tab, sets quantity per product, presses Add. Cart count updates; drawer opens on request.
3. In the drawer the buyer adjusts quantities and presses Checkout.
4. On `/checkout` the buyer enters name, phone, email, address, city, state, optional design brief text and file.
5. Buyer chooses a payment method and presses Pay.
6. Server creates the order and payment, then:
   - **Card or bank transfer:** redirect to Paystack hosted checkout, return to `/order/[token]`.
   - **Solana:** show payment request (QR, wallet connect, amount, countdown) on `/order/[token]`.
7. Server verifies payment (webhook or poll), marks order paid, sends emails.
8. `/order/[token]` shows confirmation and next step (design brief confirmation within the agreed timeline).
9. Admin sees the order, reviews the brief, moves it through production statuses.

## 7. Functional requirements

### 7.1 Catalog

- **FR-C1** Show active products grouped by category; tabs: All plus each category with at least one active product.
- **FR-C2** Product card: image, name, category, short description, unit price in naira, quantity stepper (min `products.min_qty`, default 1), Add button.
- **FR-C3** Products with no image render a neutral placeholder; layout must not shift.
- **FR-C4** Product data is fetched server-side and cached; admin edits revalidate the cache (`revalidateTag`).

### 7.2 Cart

- **FR-K1** Add, increase, decrease, remove lines. Quantity 0 removes the line.
- **FR-K2** Show line total, subtotal. Delivery is shown at checkout.
- **FR-K3** On load, reconcile cart lines against current products; drop inactive items and show a toast explaining why.
- **FR-K4** Cart survives page reload.

### 7.3 Checkout

- **FR-O1** Required fields: full name, phone (Nigerian formats accepted and normalised), email, address, city, state. Optional: brief text (max 2000 chars), up to 5 files.
- **FR-O2** Files: png, jpg, svg, pdf, ai, eps; max 10 MB each; uploaded via signed URL to the private bucket; virus scanning is out of scope but file type is validated by magic bytes server-side.
- **FR-O3** Inline field errors; focus moves to first invalid field.
- **FR-O4** Pay button label reflects method and amount (naira, or token amount for Solana).
- **FR-O5** Double-submit protection: button disabled while in flight, and the server treats a repeated request with the same idempotency key as the same order.
- **FR-O6** Delivery fee comes from `settings.delivery_fee_kobo` (flat in v1).

### 7.4 Orders

- **FR-R1** Order number format `TMS-YYMM-####`, unique, generated from a database sequence.
- **FR-R2** Order line items snapshot product name and unit price at purchase time.
- **FR-R3** `/order/[token]` shows items, totals, payment status, order status timeline, and a support contact. No buyer PII beyond first name and masked email.
- **FR-R4** Orders in `pending_payment` older than 24 hours are auto-cancelled by a scheduled job.

### 7.5 Admin

- **FR-A1** Admin-only routes enforced in middleware and again in each route handler.
- **FR-A2** Orders table: search by order number, name, email, phone; filter by status and payment status; sort by date; paginate (25 per page).
- **FR-A3** Order detail: buyer info, address, brief text, signed download links for files, items, payment records, status controls, Recheck payment button, internal notes.
- **FR-A4** Status changes are logged in `order_events` with actor and timestamp.
- **FR-A5** Products: create, edit, archive (soft delete), reorder, upload images (max 5 per product, 2 MB each after client-side resize).
- **FR-A6** Categories: create, rename, reorder. A category with products cannot be deleted; archive instead.
- **FR-A7** Buyers export: CSV of orders with buyer details. Export access is admin-only and logged.
- **FR-A8** Settings: delivery fee, merchant wallet address, USDC to NGN rate, support WhatsApp and email.

### 7.6 Notifications

- **FR-N1** On payment success: email buyer a receipt and what happens next; email admin a new-order alert with a deep link.
- **FR-N2** Email failure must not fail the payment flow. Log and retry once.

## 8. Data model

```sql
create type order_status as enum ('pending_payment','paid','design_review','in_production','ready','delivered','cancelled');
create type payment_status as enum ('unpaid','pending','paid','failed','expired','refunded');
create type payment_provider as enum ('paystack','solana');

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id),
  vendor_id uuid,                       -- reserved for multi-designer phase
  name text not null,
  slug text not null unique,
  description text,
  price_kobo int not null check (price_kobo >= 0),
  min_qty int not null default 1 check (min_qty >= 1),
  image_paths text[] not null default '{}',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create sequence order_seq;
create table orders (
  id uuid primary key default gen_random_uuid(),
  public_token uuid not null unique default gen_random_uuid(),
  order_no text not null unique,
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  address_line text not null,
  city text not null,
  state text not null,
  brief text,
  subtotal_kobo int not null,
  delivery_kobo int not null,
  total_kobo int not null,
  status order_status not null default 'pending_payment',
  payment_status payment_status not null default 'unpaid',
  idempotency_key text unique,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  name_snapshot text not null,
  unit_price_kobo int not null,
  qty int not null check (qty > 0)
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider payment_provider not null,
  reference text not null unique,       -- Paystack reference or Solana reference pubkey
  amount_kobo int not null,
  currency text not null default 'NGN',
  token text,                           -- 'USDC' or 'SOL' for Solana
  token_amount numeric,                 -- expected amount in token units
  rate_ngn numeric,                     -- NGN per token at quote time
  status payment_status not null default 'pending',
  tx_signature text unique,
  expires_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  size_bytes int not null
);

create table order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  actor text not null,                  -- 'system', 'paystack', 'solana' or admin email
  event text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

create table settings (key text primary key, value jsonb not null);
```

**Row Level Security**

- Enable RLS on every table.
- `categories` and `products`: public `select` where `is_active`. No public writes.
- `orders`, `order_items`, `payments`, `order_files`, `order_events`, `settings`: no public access at all. The public order page reads through a server route that looks up by `public_token` using the service role.
- Admin policies: allow all operations where `(auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'`.
- Indexes: `orders(created_at desc)`, `orders(status)`, `orders(buyer_email)`, `payments(order_id)`, `order_items(order_id)`.

## 9. Payments

### 9.1 Shared rules

- **PAY-1** `/api/checkout` loads products by id, recomputes prices and totals, rejects mismatches, inserts order, items and a payment row in one transaction.
- **PAY-2** An order becomes `paid` only through server-side verification, never from a client redirect or query string.
- **PAY-3** Marking paid is idempotent: re-processing the same reference or signature changes nothing and sends no duplicate emails.
- **PAY-4** Every state change writes an `order_events` row.

### 9.2 Paystack (card and bank transfer)

1. Call Paystack `POST /transaction/initialize` with `amount` in kobo, buyer `email`, unique `reference`, `callback_url` of `/order/[token]`, `metadata.order_id`, and channels limited to card and bank transfer. Confirm channel availability on the live Paystack account before launch.
2. Redirect the buyer to the returned `authorization_url`.
3. Webhook `POST /api/paystack/webhook`:
   - Read the **raw** request body. Compute HMAC SHA512 with the Paystack secret key and compare to the `x-paystack-signature` header using a timing-safe comparison. Reject on mismatch with 401.
   - Handle `charge.success`. Look up payment by `reference`.
   - Confirm with `GET /transaction/verify/:reference`: status is success, currency is NGN, amount equals `payments.amount_kobo`.
   - Mark payment and order paid. Respond 200 quickly; do heavy work (emails) after.
4. The return page `/order/[token]` also calls verify once so the buyer sees the result even if the webhook is delayed.
5. Failed or abandoned: payment stays `pending` until the order expires (FR-R4).

### 9.3 Solana Pay (USDC and SOL)

1. **Quote.** Token amount is computed server-side. USDC uses `settings.usdc_ngn_rate` (admin-set). SOL uses a price source behind a server function with a fallback to an admin-set rate. Quote is locked for 10 minutes (`expires_at`).
2. **Reference.** Generate a fresh keypair per payment; store only the public key as `payments.reference`. Discard the private key.
3. **Request.** Build a Solana Pay transfer request: recipient is the merchant wallet from settings, amount in token units, `spl-token` set to the USDC mint for USDC (omit for SOL), the reference, plus label and message. Render as a QR code and as a wallet-connect Pay button using the wallet adapter.
4. **Confirm.** `/api/solana/status?ref=...` finds signatures for the reference address, then validates the transaction with Solana Pay `validateTransfer` (recipient, amount, token mint, reference). Use `confirmed` commitment to show progress and `finalized` to mark paid.
5. **Edge cases.** Underpayment: stay pending and flag. Overpayment: accept and flag for the admin. Payment after expiry: do not auto-mark paid; flag for manual review in admin.
6. **Polling.** The page polls every 4 seconds while open. A scheduled job (Supabase `pg_cron` or an Edge Function, or Vercel Cron if the plan allows the frequency) reconciles pending Solana payments every minute. Admin has a manual Recheck button.
7. **Config.** USDC mint address, cluster and RPC URL come from env vars. Develop and test on devnet; switch cluster by env only.

## 10. Security, privacy and compliance

- Rate limit `/api/checkout` and `/api/solana/status` per IP; add a honeypot field on checkout.
- Zod-validate every input; reject unknown fields.
- Security headers: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors none`.
- Order links use a random UUID token; the status page exposes minimal PII.
- Storage: briefs bucket is private; admin downloads via short-lived signed URLs.
- Admin accounts: strong password policy; enable 2FA when available.
- Store only what is needed. Show a privacy notice at checkout and keep a retention policy aligned with the Nigeria Data Protection Act 2023, including deletion on request.
- No card data ever touches this application; Paystack hosted checkout handles it.
- Log payment events without logging secrets or full payloads containing PII.

## 11. Design system (from the prototype)

**Voice:** premium, disciplined, communal. Quality, comfort, clean finishing, timely delivery.

| Token | Dark (default) | Light |
| --- | --- | --- |
| `--bg` | `#0C0C0C` | `#F6F5F0` |
| `--surface` | `#17160F` | `#FFFFFF` |
| `--fg` | `#F3F2ED` | `#151512` |
| `--muted` | `#9B998E` | `#6B6A62` |
| `--olive` (primary action) | `#5C6B4A` | `#4A5A3A` |
| `--olive-soft` (accent text) | `#8FA37C` | `#4A5A3A` |
| `--border` | `#2A2924` | `#DAD8CE` |
| `--err` | `#D46A5A` | `#D46A5A` |

- Radius 4px. Display type: Big Shoulders Display (700 and 800). Body: Archivo (400, 500, 600).
- Motion: one hero entrance sequence on load, hover image zoom on product cards, nav background change on scroll, drawer slide. No scroll-reveal animations on every section. Honour `prefers-reduced-motion`.
- Layout: max width 1200px, asymmetric image grids, no icon-card feature grids.
- Photography leads. Product photos are real TMS production shots; replace the prototype stand-ins before launch.
- Respect safe-area insets on mobile.

## 12. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Performance | LCP under 2.5 s on a mid-range phone on 4G; images through `next/image` with responsive sizes; Lighthouse performance 90 or higher. |
| Accessibility | WCAG 2.1 AA: keyboard operable drawer and tabs, visible focus, labelled inputs, contrast checked in both themes. |
| SEO | Server-rendered landing, metadata, Open Graph image, sitemap. |
| Reliability | Payment confirmation must survive a closed browser tab (webhook and scheduled reconciliation). |
| Observability | Error tracking (Sentry or equivalent), structured logs for payment events, uptime check. |
| Browser support | Last two versions of Chrome, Safari, Firefox, Edge; iOS Safari and Android Chrome. |
| Cost | Run on free or low tiers at launch (Vercel, Supabase, Resend) with no always-on servers. |

## 13. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # server only
PAYSTACK_SECRET_KEY=                  # server only
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
SOLANA_CLUSTER=devnet                 # devnet | mainnet-beta
SOLANA_RPC_URL=                       # server only
USDC_MINT=                            # set per cluster
RESEND_API_KEY=                       # server only
ADMIN_ALERT_EMAIL=
NEXT_PUBLIC_SITE_URL=
CRON_SECRET=                          # protects scheduled endpoints
```

Provide a `.env.example` with these keys and no values. Never commit `.env`.

## 14. Build order and acceptance criteria

| Milestone | Deliverable | Done when |
| --- | --- | --- |
| M0 Foundation | Next.js and TypeScript project, Tailwind tokens, Supabase project, migrations, CI, Vercel preview deploys | A blank page deploys from `main`; migrations apply cleanly from scratch. |
| M1 Catalog | Landing sections ported from prototype, products and categories read from DB, seed data | Visual parity with the prototype; tab filtering works; images optimised. |
| M2 Cart and checkout form | Cart drawer with persistence, checkout form with validation, brief upload | A guest can fill checkout; server rejects tampered prices (test). |
| M3 Orders | `/api/checkout` transaction, order numbers, order status page, emails | Creating an order produces rows, an order page and a pending state. |
| M4 Paystack | Initialize, redirect, webhook with signature check, verify, idempotency | Test-mode card and bank-transfer payments mark orders paid; replayed webhook changes nothing (test). |
| M5 Solana | Quote, QR and wallet connect, verification, expiry, edge-case flags | Devnet USDC and SOL payments confirm; underpay, overpay and late payment behave per 9.3 (tests). |
| M6 Admin | Auth, orders list and detail, status workflow, products and categories CRUD, settings, CSV export | Admin can run an order end to end; non-admins get 403 on every admin route and API. |
| M7 Hardening and launch | Rate limits, headers, error tracking, accessibility pass, Playwright e2e, live keys, domain | e2e covers browse to paid for all three methods in test mode; launch checklist signed off. |

**Launch checklist:** live Paystack keys verified, mainnet USDC mint and merchant wallet confirmed with a small real payment, real product photos in place, support contact set, privacy notice live, backups enabled in Supabase, admin accounts created, test orders purged.

## 15. Open questions for the owner

1. **Deposits.** Custom bulk production often takes a deposit up front. Should checkout support a percentage deposit with a balance payment later?
2. **Bulk pricing.** Do prices drop at quantity thresholds, and is there a minimum order quantity per product?
3. **Delivery.** Flat fee or by state? Pickup option?
4. **Hoodie pricing.** The deck lists the hoodie at a per-set price. Confirm whether the unit is a single hoodie or a set.
5. **Refund and cancellation policy**, especially once production has started.
6. **Paystack verification.** Business verification is needed for live keys; confirm status and bank transfer channel availability.
7. **Rates.** Fixed admin-set USDC rate, or live? Who updates it and how often?
8. **Branding assets.** Final logo files, product photos for every item, support email and WhatsApp number.
9. **Domain and sender email** for transactional mail.

## 16. Instructions for AI coding agents

- Work milestone by milestone in section 14 order. Do not start a milestone until the previous one meets its acceptance criteria.
- Keep pull requests small and single-purpose. Each PR includes tests for the logic it adds.
- Money math, price recomputation, webhook signature verification, idempotency and Solana transfer validation each need unit tests before the feature is considered done.
- Do not invent keys, wallet addresses, bank details or rates. Read them from env vars or `settings`, and leave clearly marked placeholders in seed data.
- Prefer server components and route handlers. Keep client components small: cart drawer, quantity steppers, payment widgets.
- Use the design tokens in section 11 through CSS variables; do not hardcode colours.
- Never log secrets or full payment payloads; never expose server-only env vars to the client.
- When a requirement is ambiguous, check section 15 first, then choose the simplest option that keeps the data model extensible, and note the assumption in the PR description.
- Definition of done: type-check, lint and tests pass; migrations are reversible; the feature works on mobile width; keyboard and screen-reader basics verified; no console errors.

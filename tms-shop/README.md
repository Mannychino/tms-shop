# TMS storefront

Next.js App Router + TypeScript, with a Node server provided by Next.js. The original `index.html`, `branding.css`, and source assets remain as the prototype reference.

## Run

Requires Node 22.18+ and npm.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Without credentials, the catalog displays prototype seed products; checkout is disabled. With credentials, products and delivery pricing come from Supabase. No simulated payment is accepted.

## Configure orders and payments

1. Create a Supabase project and apply `supabase/migrations/001_storefront.sql` once. All tables use RLS with no browser-access policies; only the server service-role credential accesses them.
2. Fill the Supabase URL and service-role key in `.env.local`.
3. Add a Paystack **test** secret and set `NEXT_PUBLIC_SITE_URL` to your app origin.
4. Set the Paystack webhook URL to `https://your-domain/api/paystack/webhook` (a public tunnel is needed for local webhook testing).
5. Confirm card and bank-transfer channel availability for your account. The app uses hosted checkout and never collects card information.

Orders snapshot product names and integer kobo prices. The server recomputes totals, stores a unique idempotency key, verifies webhook HMAC signatures, and verifies currency/amount/status with Paystack before marking an order paid. Retrying initialization after a provider/network interruption may need reconciliation of the existing Paystack reference; it never creates a second order for the same key.

## Checks and production server

```sh
npm run typecheck
npm test
npm run build
npm start
```

`next start` serves pages and API routes together; no separate Express process is needed. Set secrets in your hosting environment. Never expose the service-role or Paystack secret with a NEXT_PUBLIC prefix.

## Migration scope / remaining PRD milestones

Implemented: preserved landing design; server-rendered catalog; React quantities/category filters; localStorage cart; checkout route; server-priced orders; private order-status links; Paystack initialization, signature checks and server verification; Supabase migration and sample products.

Still pending: Solana, admin authentication/dashboard, brief uploads, email, rate limits, order expiration/reconciliation jobs, complete payment replay/concurrency integration tests, E2E and accessibility audits, full privacy/support policies, Tailwind conversion, production deployment. Do not launch until these are addressed and test-mode checkout/webhook flows have been verified against configured services. No external project or deployment has been created automatically.

## Verification in this migration

TypeScript, unit tests and a production build passed using existing local dependencies in an isolated temporary copy (Next 16.4.2 / React 19.3.0). HTTP smoke checks returned 200 for the storefront, product API and checkout page; checkout and webhook correctly returned 503 without credentials; invalid order tokens returned 404. A clean dependency install was blocked by repeated npm registry download timeouts, so no clean-install build or lockfile is claimed. Browser interaction and real Supabase/Paystack integration remain unverified.

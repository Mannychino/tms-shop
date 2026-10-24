# TMS — The Merch Shop

Landing page, product catalog, cart and checkout flow for The Merch Shop (custom merch production, Nigeria).

**Status:** front-end prototype. Cart works in memory; payments are mocked (no real charges, no database yet).

## Run locally
No build step. Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Structure
```
index.html   # landing, shop, cart drawer, checkout (single file: HTML, CSS, JS)
assets/      # product and hero photos
```

## Edit products
Products are the `P` array near the bottom of `index.html` (name, category, price in naira, image path).

## Roadmap
- [ ] Supabase: `products`, `orders`, `order_items` tables
- [ ] Paystack (naira: cards + bank transfer)
- [ ] Solana Pay (USDC / SOL) with server-side confirmation
- [ ] Admin page for orders and buyer details
- [ ] Logo/file upload on checkout
- [ ] Reviews, announcements, vendor-added categories

## Deploy
Static site: import the repo into Vercel (or Netlify / GitHub Pages) with no build command and the root as the output directory.

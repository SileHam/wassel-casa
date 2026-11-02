# Wassel Casa

A mobile-friendly, independently branded Casablanca delivery demonstration. Built with React, Vinext and a Cloudflare D1 database through Sites. The app supports browsing, search, filters, favorites, priced carts, demo orders, history, cancellation, issue recording and restaurant/courier simulation views.

This is not a live delivery business. Merchants, reviews, timing, menus and prices are fictional. No real payment or dispatch occurs. The three role views act on the signed-in user's own demo orders. Production role authorization, payment processing, GPS, merchant onboarding and logistics are not implemented.

## Development

Use Node 24.18.0 and the starter lockfile. Run `npm run install:ci`, then `npm run db:generate` only when the schema changes. `npm run dev` starts the local preview. The portable starter supplies a loopback-only mock sign-in at `/signin-with-chatgpt?return_to=/`. Production identity is supplied by Sites; no client-supplied role or user ID is trusted by the order API.

Build with `npm run build`. Apply generated migrations to local D1 following the Sites starter instructions. Hosted D1 migrations are applied by Sites deployment. Local and hosted data are separate.

On this Windows machine, the installed npm command shim failed inside the Sites helper. The equivalent installer ran using its existing absolute npm JavaScript entrypoint and `scripts/install-ci.mjs`; no global tools were changed.

## Data and behavior

- Orders are persisted in D1 and scoped to the authenticated visitor's stable Site user ID.
- Catalog prices are calculated on the server in integer centimes; client-supplied totals are ignored.
- Duplicate request keys are unique per user. Concurrent status changes use the expected previous state.
- A basket belongs to one merchant. Changing merchants asks before replacing the basket.
- Demo service fee: 2 DH. Merchant-specific delivery is waived at 120 DH in articles. CASA10 deducts 10 DH at 80 DH in articles. These are demo rules, not a viable pricing claim.
- Favorites, language and district are device-local preferences. Orders are not stored in browser storage.
- API inputs and received order responses are validated. Mutations require same-origin requests and authenticated ownership.
- Public-page observations and unverified product hypotheses are in [docs/glovo-review.md](docs/glovo-review.md).

## Validation

Type checking and production builds pass. `tests/workflow.mjs` drives an existing Microsoft Edge through Playwright and verifies the browser order lifecycle, persisted status after reload, promotion thresholds, server pricing, duplicate requests, cancellation/state rules, concurrent transitions, issue persistence, rejected malformed input, same-origin checks, authentication, search, favorites, filters and mobile overflow. Set `WASSEL_PLAYWRIGHT_MODULE` to an installed Playwright module when it is not installed in this checkout; the test does not install or download a browser. Screenshots remain in ignored `.sites-runtime/qa/`.

Production payment processing, GPS and dispatch, separate merchant/courier identities and multi-user authorization have no real-provider verification because they are outside this demonstration.

## Photo sources

Illustrative photos downloaded from Unsplash, identified by the original image IDs: `photo-1568901346375-23c9450c58cd`, `photo-1579751626657-72bc17010498`, `photo-1512621776951-a57141f2eefd`, `photo-1499636136210-6f4ee915583e`, `photo-1547592180-85f173990554`, `photo-1542838132-92c53300491e`, `photo-1573080496219-bb080dd4f877`, `photo-1461023058943-07fcbe16d735`. They are bundled locally and are not copied from Glovo.

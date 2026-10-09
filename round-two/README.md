# Idea Forge — Round Ideathon

Independent Express + MongoDB application for MindTech Arena. Deploy **this folder** as a separate Vercel project, with production branch `round-ideathon`. The existing root application is unchanged and must not be redeployed for this module.

The separate `round-2` branch contains the other Round 2 upload. This Ideathon implementation lives on `round-ideathon`; keep its deployment separate. The source folder remains `round-two` for stable paths and deployment configuration.

## Screens

- `/`: team sign-in, public problem board, assigned challenge and private twist.
- `/admin`: CSV import, problem authoring/release, phase timer, manual auction control, allocation, credit correction, reveal and audit.
- `/auction`: independent projector display, one public problem at a time.
- `/board`: Round 2 credit board. This does not change the Round 1 leaderboard.

## Production configuration

Create a NEW MongoDB Atlas database user with **readWrite only on `mindtech_round2`**. Do not reuse Round 1 credentials. Restrict database network access to the deployment's supported egress configuration. A replica set / Atlas cluster is required for transactions.

Set these directly in the separate Vercel project's Production environment:

- `ROUND2_MONGODB_URI`: connection string for the new restricted user.
- `ROUND2_DB_NAME`: `mindtech_round2`.
- `ROUND2_ADMIN_PASSWORD`: unique password, minimum 12 characters.
- `ROUND2_SESSION_SECRET`: cryptographically random value, at least 32 characters.

The server fails closed without configuration. It explicitly selects the Round 2 database and rejects any other database name except test names beginning `mindtech_round2_test_`. This application guard complements, but does not replace, Atlas user permissions. No production credentials are included in this repository.

Use Node 22 or later. Vercel framework: Express. Root directory: `round-two`. Install: `npm ci`. Build: `npm run build`. The configured Mumbai function region should be reviewed against the actual Atlas region.

## Run locally

```sh
npm ci
# Set variables from .env.example in your shell, or use Node's env-file option:
node --env-file=.env server.js
```

`npm start` reads environment variables already set by the host. `/api/health` returns `ready` only after configuration and MongoDB connection succeed.

## Event setup

1. Finalise Round 1 scores. Export `Team ID,Team Name,Team Leader,Final Credits`.
2. Sign in to `/admin`, Teams & credits, upload and preview CSV, then confirm import. Existing IDs are skipped without modifying credit balances, assignments or access codes.
3. Export private codes and distribute **each row only to its team**. Never post the entire private-code CSV publicly.
4. Enter the 20 official public briefs, initial prices and private constraints in Problems & release. No invented or sample problems are seeded into production.
5. Preview, then release selected/all briefs. Start the 10–15 minute review phase.
6. Set phase to Bidding. Open `/auction` in another tab on the **same laptop and browser profile**, move it to the projector, and enter fullscreen. Take control in admin.
7. Choose one released problem; enter current bid and leading team manually. Confirm sold once. A final sale requires a successful database acknowledgement.
8. Set phase to Challenge work. Release twists for selected/all assigned teams. Every team receives only its assigned constraints.
9. Export results. Keep deployments frozen during the event.

## Reliability model

- Projector content is preloaded. `BroadcastChannel` carries immediate same-laptop changes; localStorage is a recovery cache of **public data only**. The database is MongoDB only.
- Projector uses server polling as fallback. Participant checks are staggered ~3 seconds, use a separate public revision, and return small unchanged responses during price changes.
- One active controller has a renewable 120-second lease. Explicit takeover is logged. No overlapping saves from one controller; stale sequences are rejected.
- MongoDB transaction commits event state and its operation record together. Transaction conflicts retry through the driver. An immutable idempotency key makes a retry after a lost response return the original result.
- A critical admin operation is retained in sessionStorage until confirmed. If a response is lost, use **Retry pending save**; do not create a different sale.
- Offline projector changes are permitted. Final sales, credit changes and reveals cannot be confirmed offline. Unsaved bidding prices may be lost if the laptop/storage fails; confirmed sales remain in MongoDB.
- Reversal is supported before a team's constraints are revealed. After reveal, reassignment is intentionally blocked because confidentiality cannot be restored.
- Team sessions are signed, expire in eight hours, use HttpOnly/SameSite=Strict cookies and Secure on Vercel. Resetting a code revokes that team's old sessions.
- The backend never returns hidden constraints through public/projector/credit APIs. Team identity comes from the signed session, not a URL parameter.
- CSP, same-origin mutation checks, persistent login throttling, safe DOM text rendering, CSV formula escaping and strict input limits are included.
- Shared Atlas cluster capacity remains shared even with separate databases/users. No claim of zero latency or immunity from hosting/network outages is made.

## Tests

```sh
npm run check
npm run test:unit     # domain + actual projector JS in a simulated DOM
npm run test:http     # HTTP/security flows with an explicit memory test double
npm test              # actual MongoDB replica-set transactions + all other suites
npm audit --omit=dev --audit-level=moderate
```

The GitHub workflow `.github/workflows/round-two-tests.yml` runs all suites on Ubuntu with a disposable MongoDB replica set, never against production. The MongoDB binary is pinned to 7.0.24 for tests. A production readiness check additionally needs real Atlas configuration and a live browser run.

The local runtime may prohibit MongoDB's process startup. A passed HTTP test double is **not** evidence of real MongoDB transaction correctness; consult the independent GitHub workflow result.

## Manual event acceptance

- Two team logins: one team cannot read another team's twist, including direct API requests.
- Same-laptop controller/projector: price changes, next/previous, refresh, lost Wi-Fi and restoration.
- Import preview and retry without duplicate rows or balance resets.
- Double sale, competing sale, unaffordable sale, lost-response retry, correction and export.
- Full review → bidding → allocation → work → selected/all reveal flow on the actual deployed MongoDB database using dedicated test teams before official import.
- Phone-sized participant layout and projector legibility in the event room.

The 20 final problem statements, production Atlas credentials and admin secret must be supplied by the organiser before the event is ready.

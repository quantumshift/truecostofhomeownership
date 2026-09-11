# True Cost of Homeownership Calculator

A national, real-time calculator for **truecostofhomeownership.com** that shows buyers their full monthly
cost of owning a home — mortgage, property taxes, insurance, utilities, maintenance, and future repair
reserves — not just the mortgage payment. Built for Empire Home Loans Inc. (Kirk Rau) as an SEO/AI-answer-engine
findable lead-gen tool.

---

## Why Next.js instead of a plain Vite SPA

This project needs to be crawlable and citable by both traditional search engines and AI crawlers (GPTBot,
ClaudeBot, PerplexityBot, Google-Extended, etc.), which means the descriptive page content has to exist in the
raw HTML response — not only after client-side JavaScript runs. Next.js's App Router server-renders `app/page.tsx`
(the `<h1>`, explainer paragraph, FAQ section, and JSON-LD) on every request, while the calculator itself
(`components/Calculator.tsx`) is a client component that hydrates and updates in real time. This deploys to
Netlify (see Deploy section below) via the official Next.js Runtime, which turns the API routes into serverless
functions automatically — same SSR behavior as any other host.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

Open http://localhost:3000

---

## Environment variables

See `.env.example` for the full list with comments. In short:

| Variable | Required for | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | "Estimate costs for this ZIP" utilities feature, and the background luxury market check | Server-side only, from console.anthropic.com |
| `RESEND_API_KEY` | "Email me my results" | Server-side only, from resend.com |
| `RESEND_FROM_ADDRESS` | "Email me my results" | Must be a verified sender domain in Resend |
| `LEAD_NOTIFICATION_EMAIL` | Lead notifications | Defaults to Kirk@EmpireHomeLoans.com |
| `NEXT_PUBLIC_SITE_URL` | Canonical/OG tags, sitemap | e.g. https://truecostofhomeownership.com |

Until `ANTHROPIC_API_KEY` / `RESEND_API_KEY` are set, those two features return a clear error to the user instead
of a false success — the ZIP estimate button shows an inline message and the email form shows a send error.

### Email delivery (`RESEND_API_KEY`) is intentionally not configured here

Per Kirk: the "Email me my results" send-and-notify flow is being completed inside the broker marketplace
website builder, not in this standalone deployment. `/api/submit-lead` is fully built and tested (PDF
generation, lead-email content, error handling) and returns a clean "not configured" response until Resend
credentials are added — this is expected, not a bug, and not an open task on this project. No action needed here
unless that changes.

### No CRM is wired in yet

Right now, submitting the lead form sends two emails via Resend: the branded PDF report to the user, and a lead
notification (name, email, full breakdown, PDF attached) to `LEAD_NOTIFICATION_EMAIL`. That's the same pattern
used in the seller-strategy-calculator project. If Kirk wants leads to land in an actual CRM (Follow Up Boss,
HubSpot, etc.) instead of or in addition to email, that's a second delivery call to add in
`app/api/submit-lead/route.ts` — happy to wire it up once we know which CRM and what API access looks like.

---

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # run the production build locally
npm run typecheck  # TypeScript check with no emit
```

---

## Branding

- Primary color: `#003366` (navy), accent `#0a5ca8` — set in `tailwind.config.ts`
- Logo: `components/Logo.tsx` is a placeholder shield mark + wordmark in the brand colors, used both on the page
  header and in the PDF (`lib/pdf.tsx`). Swap in the real logo file from Kirk once provided — replace the inline
  SVG paths in both places, or point them at an `<img>`/embedded image if a raster/vector file is supplied.
- Footer contact info lives in `components/Footer.tsx` and `lib/pdf.tsx` (kept in sync manually since the PDF
  library can't share React components with the web page).

---

## Calculation reference

| Category | Formula |
|---|---|
| Monthly P&I | Standard amortization: `P × [r(1+r)^n] / [(1+r)^n − 1]` |
| PMI | User-entered monthly estimate, shown only when down payment < 20% |
| Monthly property tax | Annual property tax ÷ 12 |
| Monthly utilities | Electricity + gas are single blended monthly averages (no seasonal split — regional summer/winter swings vary too much nationally for one formula to hold up) |
| Monthly maintenance | Square footage × $0.14 (HUD/VA standard maintenance-and-utilities allowance), plus any luxury line items below |
| Monthly repair reserve (per system) | Replacement cost ÷ max(1, lifespan − age) ÷ 12 |

System reference data (`lib/types.ts` → `SYSTEM_REFERENCE_DATA`): Roof (25 yr / $14,500), HVAC (17 yr / $9,838),
Water Heater (10 yr / $1,550). These are national medians — update them if better regional data becomes available.
When luxury mode is triggered, `LUXURY_SYSTEM_REFERENCE_DATA` is used instead (same lifespans, higher
costs: Roof $40,000, HVAC $22,000, Water Heater $6,500) — `calculateSectionTotals` picks whichever table applies
based on `state.isLuxuryMode`.

---

## Luxury mode

A ZIP code is collected once, at the top of Mortgage & Financing, and reused for both the utility estimator and
this feature (no asking twice). On blur (not on every keystroke), if the ZIP is a complete 5-digit value,
`Calculator.tsx` fires two background calls:

1. `/api/zip-top-tier-value` — looks up the ZIP directly in `data/zhvi-top-tier.json`, a local snapshot of
   Zillow Research's published ZHVI top-tier (67th–100th percentile) home value index, ZIP-level, smoothed &
   seasonally adjusted. This is real published data, not an AI guess, and covers roughly 26,000 of the ~41,000
   US ZIP codes (see "Refreshing the Zillow data" below).
2. `/api/estimate-market`, which asks Claude for a rough county median home price and a typical luxury HOA
   dues range for that ZIP — same "rough estimate, not a live lookup" standard as the utility estimator. This
   call still runs unconditionally because the HOA range has no Zillow equivalent, and its county median
   doubles as the luxury-threshold fallback described below.

No button, no loading state the visitor has to notice — it's a quiet background check, the same pattern as PMI
auto-toggling based on down payment.

**Threshold logic**, computed in `Calculator.tsx`:

- If Zillow has a top-tier value for this ZIP, `state.isLuxuryMode` flips on once the purchase price meets or
  exceeds that value directly — no multiplier, since the top-tier figure already *is* the local upper segment
  of that ZIP's market, not an approximation of one. This fixes a real failure mode: a county-wide median can
  be wildly unrepresentative of a specific ZIP (e.g. Mobile County, AL's ~$230k county median vs. downtown
  ZIP 36602's own ~$680k top-tier value — a $600k home there is unremarkable, not "luxury").
- If Zillow has no data for this ZIP, it falls back to the AI-estimated county median from
  `/api/estimate-market`, flipping on at 2x that median (the prior, cruder heuristic — kept only as a fallback,
  not the primary path).
- `state.luxuryThresholdSource` (`'zillow' | 'ai-estimate' | null`) records which path fired, so the PDF report
  and the on-page note near the HOA field can say plainly which kind of data justified Luxury Mode rather than
  presenting a real ZIP-level figure and an AI guess identically.

Either way, once `state.isLuxuryMode` flips on (synced from Calculator.tsx's derived value into
CalculatorState, so it's also correct in the server-side recompute for the PDF/email), three things change: four
extra expense fields appear inside Utilities, under Home Operating Costs (still counted in its total) —
Pool/Spa Maintenance, Landscaping Crew, Housekeeping/Property Staff, and Security System/Monitoring, alongside
the existing generic "Other" catch-all field, not replacing it; the System Replacements reference table switches
from national-median costs to `LUXURY_SYSTEM_REFERENCE_DATA` (same lifespans, higher costs); and the HOA field
in Property Taxes & Insurance gets an informational reference note showing the typical luxury HOA range for the
area — informational only, never auto-filled, since actual dues vary too much property to property.

If the `/api/estimate-market` call fails or `ANTHROPIC_API_KEY` isn't set, `state.marketEstimateFailed` flips on
and a notice appears (ZIP field on-page, report footer, both lead emails) — same as before this fix. The HOA
range simply won't show. If Zillow also had no data for that ZIP, luxury mode itself silently stays off; nothing
about the core tool depends on either call working.

### Refreshing the Zillow data

`data/zhvi-top-tier.json` is a static snapshot, not a live API call — Zillow only republishes this file monthly
(around the 16th), so hitting it on every page load would be pointless. Refresh it by running:

```
node scripts/refresh-zillow-zhvi.mjs
```

This re-downloads the current CSV from Zillow Research (see the script header for the source page and file
naming caveat — Zillow has changed this filename before) and overwrites `data/zhvi-top-tier.json` with a
ZIP → dollar-value lookup plus an `asOf` date. No automated schedule exists yet; re-run it manually, roughly
monthly.

---

## Project structure

```
app/
  page.tsx                 SSR page: H1, explainer, FAQ, JSON-LD — wraps Calculator
  layout.tsx                Metadata (title, description, canonical, OG/Twitter)
  robots.ts, sitemap.ts     Crawler access (no AI-crawler disallow rules) + sitemap
  api/
    estimate-utilities/     Calls Claude for rough ZIP-based utility estimates
    estimate-market/         Calls Claude for county median price (luxury-threshold fallback) + luxury HOA range
    zip-top-tier-value/      Looks up ZIP in the local Zillow ZHVI top-tier data (primary luxury threshold)
    submit-lead/             Recomputes totals server-side, renders PDF, sends both emails
data/
  zhvi-top-tier.json        ZIP -> Zillow ZHVI top-tier dollar value, refreshed via scripts/refresh-zillow-zhvi.mjs
scripts/
  refresh-zillow-zhvi.mjs   Manual monthly refresh of data/zhvi-top-tier.json from Zillow Research
components/
  Calculator.tsx            Client orchestrator — owns all calculator state, luxury-mode derivation
  TierGroup.tsx              Generic tier wrapper (eyebrow + H2 title + one-line intro + boxed container),
                             used for all three tiers: Principal/Interest/Taxes & Insurance, Home Operating
                             Costs, Owner's Reserve
  sections/                 One component per calculator section (each renders its own H3). Every section
                             follows the same five-part shape: title, one-line orienting subtitle, inputs,
                             calculated result, one EducationBubble after the result — that's the only place
                             substantive explanatory copy lives per section
  ui/                       Shared inputs (CurrencyInput, NumberInput, ToggleGroup, CollapsibleSection,
                             EducationBubble — the single post-result education block — …)
  FaqSection.tsx             Static FAQ content (also feeds the FAQPage JSON-LD)
  Footer.tsx, Logo.tsx
lib/
  types.ts                  Calculator state shape + reference data
  calculations.ts            Pure calculation functions (amortization, reserves, totals)
  format.ts                  Currency/ZIP/email formatting + validation
  pdf.tsx                     @react-pdf/renderer document used by /api/submit-lead
```

---

## Deploy (Netlify)

`netlify.toml` is already set up with the official `@netlify/plugin-nextjs` build plugin, which detects the
App Router, server-renders `/` on every request, and turns `app/api/estimate-utilities` and
`app/api/submit-lead` into Netlify Functions automatically — no extra config needed.

```bash
npx netlify deploy --build --prod
```

Or connect the repo in the Netlify dashboard (New site from Git) and it will pick up `netlify.toml`
automatically on every push. Either way, add the environment variables from `.env.example` in
Site configuration → Environment variables before the ZIP-estimate and email features will work — until then
they fail with a clear in-app message instead of a false success.

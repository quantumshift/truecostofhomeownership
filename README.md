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
| `ANTHROPIC_API_KEY` | "Estimate costs for this ZIP" utilities feature | Server-side only, from console.anthropic.com |
| `RESEND_API_KEY` | "Email me my results" | Server-side only, from resend.com |
| `RESEND_FROM_ADDRESS` | "Email me my results" | Must be a verified sender domain in Resend |
| `LEAD_NOTIFICATION_EMAIL` | Lead notifications | Defaults to Kirk@EmpireHomeLoans.com |
| `NEXT_PUBLIC_SITE_URL` | Canonical/OG tags, sitemap | e.g. https://truecostofhomeownership.com |

Until `ANTHROPIC_API_KEY` / `RESEND_API_KEY` are set, those two features return a clear error to the user instead
of a false success — the ZIP estimate button shows an inline message and the email form shows a send error.

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
| Monthly utilities (electric/gas) | Summer and winter weighted 3 months each; spring/fall (6 months) use the average of the two |
| Monthly maintenance | Square footage × $0.14 (HUD/VA standard maintenance-and-utilities allowance) |
| Monthly repair reserve (per system) | Replacement cost ÷ max(1, lifespan − age) ÷ 12 |

System reference data (`lib/types.ts` → `SYSTEM_REFERENCE_DATA`): Roof (25 yr / $14,500), HVAC (17 yr / $9,838),
Water Heater (10 yr / $1,550). These are national medians — update them if better regional data becomes available.

---

## Project structure

```
app/
  page.tsx                 SSR page: H1, explainer, FAQ, JSON-LD — wraps Calculator
  layout.tsx                Metadata (title, description, canonical, OG/Twitter)
  robots.ts, sitemap.ts     Crawler access (no AI-crawler disallow rules) + sitemap
  api/
    estimate-utilities/     Calls Claude (Haiku) for rough ZIP-based utility estimates
    submit-lead/             Recomputes totals server-side, renders PDF, sends both emails
components/
  Calculator.tsx            Client orchestrator — owns all calculator state
  sections/                 One component per calculator section (1–6)
  ui/                       Shared inputs (CurrencyInput, NumberInput, ToggleGroup, CollapsibleSection…)
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

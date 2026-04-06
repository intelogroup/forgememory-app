# CLAUDE.md

Next.js 14 (App Router) dashboard for Forgememo. Users log in via magic link, buy credits, monitor usage.

**Production:** `https://forgememory-app.vercel.app` — auto-deploys on push to `main`
**Backend:** `https://forgememo-server.onrender.com` (Go, port 8000 locally)

## Run locally

```bash
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local
npm run dev   # http://localhost:3000
```

## Auth flow

### Web login
1. `/login` → `sendMagicLink()` → `POST /webapp-auth/send-link` (backend creates user, emails link)
2. User clicks link → `GET /auth/callback?token=<api_key>&source=<source>` → sets `fm_token` cookie

### CLI login (`forge login`)
1. CLI starts local callback server on random port, opens `/cli-auth?callback=<url>&state=<hex>`
2. `/cli-auth` sets `cli_callback` + `cli_state` cookies (10 min TTL), redirects to `/login?source=cli`
3. After magic link → `/auth/callback` reads cookies → redirects browser to CLI callback URL with `?token=&state=`
4. CLI receives token, saves config. If `--purchase`, opens `/billing/cli-setup` with a fresh payment callback URL.

### CLI payment (`forge login --purchase`)
1. `/billing/cli-setup` stores `cli_callback` + `cli_state` in sessionStorage, redirects to `/billing?source=cli`
2. User picks pack → Stripe checkout (or `/checkout/test` in dev) → `/billing/success?source=cli`
3. `CliCallback` reads sessionStorage, fetches CLI payment callback URL → CLI prints "Payment confirmed."

**Dev mode:** backend returns `magic_link` in `/webapp-auth/send-link` response when `RESEND_API_KEY` unset. `/checkout/test` simulates payment without Stripe.

## Routes

| Route | Public | Purpose |
|-------|--------|---------|
| `/login` | yes | Magic-link form |
| `/cli-auth` | yes | CLI OAuth entry — sets cookies, redirects to login |
| `/auth/callback` | yes | Sets `fm_token` cookie; redirects CLI or web |
| `/auth/verify` | yes | "Check your email" page |
| `/checkout/test` | yes | Dev-mode payment simulator |
| `/billing/cli-setup` | protected | Stores CLI payment callback, redirects to billing |
| `/dashboard` | protected | Usage stats + balance |
| `/billing` | protected | Buy credit packs |
| `/billing/success` | protected | Post-payment; calls back to CLI if source=cli |
| `/settings` | protected | API key, provider info |

## Key files

| File | Purpose |
|------|---------|
| `middleware.ts` | Auth guard — public paths: `/login`, `/auth/*`, `/cli-auth`, `/checkout/*` |
| `lib/api.ts` | All backend calls; `sendMagicLink` passes `source` through callback URL |
| `app/cli-auth/route.ts` | Sets cookies, redirects to `/login?source=cli` |
| `app/auth/callback/route.ts` | Reads `cli_callback` cookie → redirects to CLI or dashboard |
| `app/billing/cli-setup/page.tsx` | Writes sessionStorage, redirects to billing |
| `app/billing/success/cli-callback.tsx` | Fires fetch to CLI payment callback (CORS, once-only ref guard) |

## Env vars

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://forgememo-server.onrender.com` (or `http://localhost:8000`) |

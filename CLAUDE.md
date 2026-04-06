# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Next.js 14 (App Router) web dashboard for Forgememo — the managed-service frontend.
Users log in via magic link, buy credit packs, and monitor their distill usage.

**Production URL:** `https://forgememory-app.vercel.app`
**Deployed on:** Vercel (project `forgememory-app`, team `intelogroups-projects`, auto-deploy from `main`)
**Backend API:** `https://forgememo-server.onrender.com` (Python FastAPI on Render)

---

## Run locally

```bash
npm install

# Point at production backend (easiest — no local server needed)
echo 'NEXT_PUBLIC_API_URL=https://forgememo-server.onrender.com' > .env.local

# Or point at local backend (must be running on port 8000)
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

npm run dev   # http://localhost:3000
```

---

## Auth flow

1. User visits any protected page → `middleware.ts` checks for `fm_token` cookie → redirects to `/login`
2. `/login` — user enters email → `sendMagicLink()` POSTs to `NEXT_PUBLIC_API_URL/webapp-auth/send-link`
3. Backend emails a link → user clicks → hits `GET /webapp-auth/verify?token=...` on backend
4. Backend issues JWT, redirects to `/auth/callback?token=<jwt>`
5. `/auth/callback` — sets `fm_token` cookie, redirects to `/dashboard`

All API calls send `Authorization: Bearer <fm_token>` header (read from cookie via `lib/auth.ts`).

---

## Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `/login` | public | Email magic-link form |
| `/auth/callback` | public | Receives JWT from backend, sets cookie |
| `/auth/verify` | public | "Check your email" holding page |
| `/dashboard` | protected | Usage stats, balance, recent runs |
| `/billing` | protected | Buy credit packs (Stripe Checkout) |
| `/billing/success` | protected | Post-purchase confirmation |
| `/settings` | protected | Provider info, API key |

---

## Key files

| File | Purpose |
|------|---------|
| `middleware.ts` | Edge auth guard — redirects to `/login` if no `fm_token` cookie |
| `lib/api.ts` | All backend fetch calls — reads `NEXT_PUBLIC_API_URL` |
| `lib/auth.ts` | `getSession()` — reads `fm_token` from Next.js cookie store |
| `app/login/page.tsx` | Magic-link login form (wrapped in Suspense for `useSearchParams`) |
| `app/auth/callback/` | Sets cookie after magic-link verify redirect |
| `app/dashboard/` | Stats: total runs, balance, recent activity |
| `app/billing/` | Stripe Checkout trigger + pack display |
| `app/settings/` | User settings page |
| `vercel.json` | Rewrites for `/api/v1/*` and `/api/auth/*` |

---

## Test the full flow manually

```bash
# 1. Start dev server
NEXT_PUBLIC_API_URL=https://forgememo-server.onrender.com npm run dev

# 2. Open http://localhost:3000
# → Should redirect to /login (no fm_token cookie)

# 3. Enter email → click "Send magic link"
# → Check inbox for link from noreply@forgememo.com

# 4. Click link → redirected to /auth/callback → then /dashboard
# → Should see balance_usd and total_runs

# 5. Go to /billing → click a pack → Stripe test checkout
#    Use card: 4242 4242 4242 4242, any future date, any CVC
# → After payment, balance should increase

# 6. Go to /settings → verify provider shows "forgemem"
```

---

## Test against production backend directly

```bash
BASE=https://forgememo-server.onrender.com

# Send magic link
curl -X POST $BASE/webapp-auth/send-link \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","callback_url":"https://forgememory-app.vercel.app/auth/callback"}'

# After clicking link in email, copy token from URL then:
TOKEN=<jwt>
curl $BASE/v1/stats -H "Authorization: Bearer $TOKEN"
curl $BASE/v1/activity -H "Authorization: Bearer $TOKEN"
curl $BASE/v1/balance -H "Authorization: Bearer $TOKEN"
```

---

## Vercel env vars

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://forgememo-server.onrender.com` |

---

## Deploy

Any push to `main` on `intelogroup/forgememory-app` triggers a Vercel production deploy automatically.

```bash
# Manual deploy (from repo root)
vercel deploy --prod
```

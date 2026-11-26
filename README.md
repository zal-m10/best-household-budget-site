# Wijaya Household Budget

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) [![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/zal-m10/best-household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) [![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/zal-m10/best-household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

A household budget site for Keluarga Wijaya — a family of four in Jakarta —
keeping their budget for November 2026. Built for the make.fun bounty
"best-household-budget-site-20261126-1457".

## What it does

- **Dashboard** — total balance, income vs spending, savings rate, spending
  by category (SVG donut), budget check, recent spending, upcoming bills.
- **Transactions** — all 38 November transactions with search, category and
  month filters, plus a working "Add transaction" form: spending or income,
  pick the wallet it comes from or goes to, and attach a photo of the receipt
  or bank / QRIS payment proof — a Camera button (camera on a phone) and a
  Gallery button (system picker with the phone's photos). Tap a receipt
  thumbnail to enlarge it. Everything stays on the device.
- **Debts** — money the family owes (utang) and money owed to it (piutang),
  with totals for each, due dates and a "Mark paid" flow that moves the
  wallet balance only when a debt is settled: recording one is neither
  income nor spending.
- **Budget** — budget vs actual per category with progress bars and an
  edit-a-budget form that updates every total on the site.
- **Goals** — three savings goals with progress and a working "Add money"
  flow that moves money from the main account to savings.
- **Reports** — six-month income vs spending trend, monthly savings bars,
  top categories, a debts summary (total piutang and total utang still
  outstanding) and insights computed from the month's transactions.

Every figure comes from `app/data.js`; edits persist in localStorage.
The site is static files only — no network requests, no libraries, no
webfonts — and works offline in desktop Chrome and on a phone.

## Layout

- `app/index.html`, `app/style.css` — Monarch design (warm linen, one Ember
  Orange accent, serif headings)
- `app/data.js` — the household's numbers, the single source of truth
- `app/views.js` — one render function per page
- `app/charts.js` — hand-rolled inline SVG charts
- `app/main.js` — hash router, state and control wiring
- `main.ts` — the hand-in program (Node 22, stdlib only): copies `app/` and
  `screenshots/` to the output directory and writes `dossier.json`
- `screenshots/` — four real renders of the running site

## Run it

```
python3 -m http.server -d app 8080   # serves app/ at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

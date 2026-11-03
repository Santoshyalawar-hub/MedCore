# MedCore HMS – Multi-tenant SaaS Hospital Management Platform (v3.0)
Read `docs/ARCHITECTURE.md` first (full product + frontend architecture).

## Run
- Node 18+: `npm install` then `npm run dev`
- No Node: double-click `standalone/index.html`

## What this is — and is not
A complete **front-end with a simulated backend** (rules enforced in `src/mocks/service.js` and `src/mocks/adapter.js`, data in browser localStorage). Great for demos and for defining the real API. **It is not a secure production system**: there is no real server, database, e-mail, payment or real authentication yet (see docs/API.md).

## Start here
1. `docs/DEMO_FLOW.md` – step-by-step flow check (8 demos)
2. `docs/ASSESSMENT_AND_PLAN.md` – assessment, plan, status
3. `docs/API.md` – contract for the real backend
4. `docs/ARCHITECTURE.md` – folder structure and standards

## Run
`npm install && npm run dev`, or double-click `standalone/index.html`. `npm test` runs 41 tests.
The site opens on the **public homepage**. Login: top-right → Login. Demo password for seeded accounts: `Demo@123`
(admin@medcore.io · admin@citycare.com · admin@sunrise.com · doctor@/nurse@/reception@/pharmacy@/lab@/accounts@/hr@/stores@citycare.com · patient@citycare.com).
Emails are shown in Platform Owner → Email Outbox and as "Demo mode" links. "Reset" = clear this site's data in your browser.

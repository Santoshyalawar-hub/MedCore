# MedCore HMS – Product & Frontend Architecture (v2.0)
Multi-tenant SaaS Hospital Management Platform. This is the primary development reference: build module by module (frontend first, backend later).
Legend: ✅ implemented in this repo · 🔜 specified here, to be built.

## 1. Product vision & personas
One platform sold to many hospitals (tenants) on subscription plans. Each hospital's staff get role-specific workspaces; the vendor's Global Super Admin runs the platform. Business value: fewer no-shows, higher bed utilisation, faster revenue cycle, safer stock/medication, predictive operations (AI) and automation.

## 2. Multi-tenancy model
- **Tenant** = hospital (slug, name, plan, branding, feature flags). URL: `/t/:slug/...` for hospital users, `/platform/...` for the Super Admin. ✅
- Identity carries `tenant` + `role`; every API call sends `X-Tenant-Id` and a correlation id (`core/api/http.js`). Backend must enforce isolation; frontend never trusts tenant from the URL alone (guard compares slug with session tenant). ✅
- Branding/theming per tenant 🔜 (CSS variables from tenant settings). Multi-branch (Enterprise) 🔜: `branchId` header + branch switcher in tenant header.

## 3. Subscription & feature management ✅
`config/plans.js` maps Starter / Professional / Enterprise to feature flags (core, pharmacy, lab, billing, hr, inventory, analytics, ai, automation, audit, multi_branch). Each module declares its `feature` in `config/modules.js`. `moduleState()` returns `ok | forbidden | upgrade`: forbidden → 403 page; upgrade → upsell page; sidebar shows 🔒. Backend will return entitlements in `/me`; the shape is already the contract. Try `admin@sunrise.com` (Starter) vs `admin@citycare.com` (Enterprise).

## 4. Roles, layouts & permissions
Permission = `access[module] = "r" | "rw"` per role (`config/roles.js`); UI asks `can(user, module, "write")`. Backend remains authoritative (default deny, record-level rules such as own-patient / assigned-patient access).

| Role | Layout | Sidebar modules | Dashboard focus |
|---|---|---|---|
| Global Super Admin | Platform (dark console) | Tenants, Plans & billing, Platform audit | Tenants, MRR, uptime, incidents |
| Hospital Administrator | Executive | Patients, Appointments, Beds, Users, HR, Billing, Inventory, Reports, AI, Automation, Audit, Subscription | Hospital operations + AI + approvals |
| Hospital Management | Executive | Reports, Billing, Beds, Appointments, HR, AI, Audit, Subscription (read-only) | Revenue, satisfaction, strategy insights |
| Accountant | Executive | Billing, Claims, Reports, Purchase orders (r) | Receivables, claim risk, cash |
| HR Manager | Executive | Employees, Roster, Users (r), Reports | Headcount, leave, staffing gaps |
| Doctor | Clinical | Patients, Appointments, Consultations, Prescriptions, Lab orders, Beds (r), AI | Today's clinic, results, clinical alerts |
| Nurse | Clinical | Patients (r), Beds & wards, Consultations (r), Prescriptions (r), Lab (r), Roster (r) | Ward tasks, meds due, vitals |
| Pharmacist | Clinical | Prescriptions (r), Pharmacy queue, Inventory (r) | Dispensing, stock/expiry alerts |
| Lab Technician | Clinical | Lab orders, Patients (r) | Worklist, turnaround, quality alerts |
| Receptionist | Front desk (icon rail) | Patients, Appointments, Billing (r), Beds (r) | Check-in queue, no-show risk |
| Inventory Manager | Front desk (icon rail) | Inventory, Purchase orders, Pharmacy (r), Reports | Stock value, reorder, open POs |
| Patient | Front (portal) | Appointments, Prescriptions, Lab, Billing (all r) | Next visit, reminders |

Planned roles 🔜: Radiologist, Billing Officer, Ward Manager, Quality/Compliance Officer, IT Admin, Tenant Support.

## 5. Layout hierarchy ✅
`Providers (error boundary → auth → notifications)` → `Router` → **Global/Auth layout** (login) → **Shell guard** (session + tenant scope) → **Role layout** (`PlatformLayout`, `ExecutiveLayout`, `ClinicalLayout`, `FrontLayout`) → **Module page** (`ModulePage`: access + plan gate) → feature page → shared components. Layouts differ in navigation pattern, density, header content and quick actions (e.g. Code Blue in Clinical, primary action button in Front). Shared pieces live in `layouts/parts.jsx` (NavItems, MobileNav, UserBar).

## 6. Folder structure & responsibilities
```
src/
├─ app/            Providers (error boundary, auth, notifications) and App routing/guards
├─ config/         env.js · plans.js (feature flags) · modules.js (registry) · roles.js (RBAC + layout)
├─ core/           Cross-cutting infrastructure, no UI
│  ├─ api/http.js  Single HTTP client, tenant/correlation headers, mock↔real switch
│  ├─ auth/        AuthContext (session, login/logout; token in memory when real backend is used)
│  ├─ rbac.js      can(), hasFeature(), moduleState(), navFor(), basePath()
│  └─ errors.js    AppError + normalizer (401/403/404/409/422/5xx mapping)
├─ layouts/        Role layouts + AuthLayout + shared navigation parts
├─ features/       One folder per business module (components, hooks, services, validations, index)
│  ├─ auth · dashboard (role dashboard config) · modules (DataModule, ModulePage)
│  └─ ai · automation · notifications · subscription
├─ shared/         ui/ (Card, Kpi, Pill, DataTable, Skeleton, ErrorState) · hooks/ · utils/ · validation/
├─ mocks/          db.js + adapter.js (synthetic data; replaced by MSW/real API)
└─ styles          index.css (Tailwind + design tokens as component classes)
docs/ARCHITECTURE.md
```
Rules: layers import downward only (pages → features → shared → core/config); features never import each other's internals (promote to `shared`); no `fetch` outside `core/api`; no role checks with strings in components (use `can()`); no PHI in URLs, titles or persistent storage.
Scale-out 🔜: when a module outgrows the generic `DataModule`, create `features/<module>/{pages,components,hooks,services,validations}` and register its page in `ModulePage`'s `CUSTOM` map; add `routes` lazy loading per layout; add `store/` only if cross-module client state appears.

## 7. Module catalogue (23 modules ✅ registered)
Core: Patients, Appointments, Beds & wards, Consultations, Prescriptions · Ancillary: Pharmacy queue, Lab orders · Finance: Billing, Insurance claims · People: Employees, Roster · Supply: Inventory, Purchase orders · Insight: Reports, AI insights, Automation · Admin: Users & roles, Audit log, Notifications, Subscription · Platform: Tenants, Plans & billing, Platform audit.
**v2.1 status ✅:** every table module has full CRUD (schema-driven forms in `config/schemas.js`), search, status filter, sortable columns, pagination, detail view, status-workflow dropdown, CSV export, delete confirmation, toasts, role-based read/write, patient own-records filter, and automatic audit logging. Platform Super Admin can create/suspend tenants and manage plans. Idle-timeout, profile/permissions page and automated tests (15) are included. To customise a module beyond the generic engine, add a page under `features/<module>/` and register it in `ModulePage` (`CUSTOM`).

## 8. Key workflows (to implement per module)
1. **Patient journey:** register → book → check-in (reception) → consultation (doctor) → lab/prescription orders → pharmacy dispense + lab result release → invoice/claim (accounts) → discharge checklist (nurse, pharmacy, billing) → patient portal access.
2. **Stock-to-dispense:** low stock alert (AI/automation) → draft PO (inventory) → approval (admin) → goods received → stock updated → pharmacy dispensing consumes stock.
3. **Claim lifecycle:** invoice → pre-auth → submit → insurer response → rejection review (AI anomaly hint) → resubmit/write-off.
4. **Staffing:** roster draft → AI gap detection → HR publish → nurse view → leave approvals.
5. **Tenant onboarding:** Super Admin creates tenant → picks plan → entitlements issued → tenant admin invited → configures roles/branches.

## 9. AI, analytics, notifications, automation ✅ (UI + mock data)
- **AI insights:** no-show risk, bed-demand forecast, stock-out prediction, billing-anomaly, staffing gaps; natural-language "Ask MedCore AI". Gated by `ai` feature. Real integration: `/ai/insights`, `/ai/ask`; outputs are advisory, show confidence + audience, never auto-change clinical data.
- **Dashboards:** every role has KPI cards, charts and action lists from `features/dashboard/dashboardConfig.js` (swap for `/dashboard/:role` API).
- **Notifications:** bell with unread count, centre with read/unread; levels critical/warning/info/ai; no clinical detail in titles. Real-time via SSE/WebSocket 🔜.
- **Automation:** tenant-level rules with enable/disable (admin only). Rule builder (trigger → condition → action) 🔜.

## 10. Backend integration plan
Contract (suggested, to be approved as OpenAPI): `POST /auth/login|refresh|logout`, `GET /me` (user, role, permissions, tenant, entitlements), `GET|POST|PATCH /{module}` with `page,pageSize,q,sort,filter`, `GET /dashboard`, `GET /notifications`, `GET /ai/insights`, `/admin/tenants`, `/admin/plans`. Switch with `VITE_USE_MOCKS=false`; envelope `{data,meta}`; errors normalised to `AppError`. Auth: access token in memory, refresh via httpOnly cookie, idle timeout (`VITE_SESSION_IDLE_MINUTES`) 🔜. Replace `useAsync` with TanStack Query and add React Hook Form + Zod when forms grow.

## 11. Build roadmap
1. Harden foundation: lazy routes, TanStack Query, MSW, idle timeout, i18n. 2. Patients + Appointments (full CRUD, wizard, calendar). 3. Clinical (consultation, orders, e-prescription). 4. Pharmacy + Lab + Inventory. 5. Billing + claims. 6. HR + roster. 7. Platform console (tenant CRUD, plan changes, impersonation with audit). 8. AI/automation with real services. 9. Tests (Vitest, RTL, Playwright, axe), CI/CD, monitoring.

## 12. Engineering standards
Feature-based modules; config-driven nav/permissions; accessible semantic HTML (WCAG 2.2 AA target), status never by colour alone; responsive 360–1920px (mobile nav for small screens); loading/empty/error/forbidden/upgrade states on every data view; conventional commits, PR review, ESLint + Prettier; no secrets in `VITE_*`; synthetic data only; audit-friendly (every sensitive read/export is logged by backend).

## 13. v3.0 additions (see ASSESSMENT_AND_PLAN.md)
New folders: `features/public` (website, booking, registration forms), `features/platform` (owner console), `features/setup`, `features/employees`, `features/patient`; `mocks/store.js` (platform DB), `mocks/service.js` (business rules ↔ API), `mocks/adapter.js` (tenant-scoped table API with role/plan/status enforcement). Routes: public `/…`, `/platform/*` (owner), `/t/:slug/*` (hospital staff), `/me/*` (patients), token pages `/activate|reset|verify/:token`.

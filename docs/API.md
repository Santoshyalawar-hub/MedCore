# API contract for the real backend (each row = one function in `src/mocks/service.js` or the table API in `src/core/api/http.js`)
Conventions: JSON, `Authorization: Bearer <access token>` (refresh in httpOnly cookie), tenant resolved **server-side from the token** (never from the URL/body), envelope `{data, meta}`, errors `{code, message}` with HTTP 400/401/403/404/409/422/429. Lists take `page,pageSize,q,sort`.

| Area | Endpoint | Service function | Rule enforced |
|---|---|---|---|
| Public | `GET /public/hospitals?q&city&specialty&service` | listHospitals | published + active + `core` feature only |
| Public | `GET /public/hospitals/{slug}` | getHospital | 404 if unpublished/suspended |
| Public | `GET /public/doctors?q&specialty&city` | listDoctors | only active doctors with fee > 0 |
| Public | `GET /public/hospitals/{slug}/doctors/{id}/slots?date=` | getSlots | hours, working days, past, taken |
| Public | `POST /public/hospital-registrations` | registerHospital | validation, duplicate name/email, consent |
| Public | `POST /public/hospital-registrations/verify-email` | verifyEmail | token |
| Public | `POST /public/demo-requests` | requestDemo | consent |
| Auth | `POST /auth/register` (patient) | registerPatient | unique email, password policy |
| Auth | `POST /auth/login` · `/refresh` · `/logout` | loginAccount | lockout, account + tenant status |
| Auth | `POST /auth/activate` · `/forgot-password` · `/reset-password` | acceptToken, requestReset | single-use, expiring, generic reset reply |
| Patient | `POST /appointments` `{hospital,doctorId,date,time}` | bookAppointment | **transaction + unique(doctor,date,time) constraint**, tenant active |
| Patient | `GET /me/appointments` · `POST /me/appointments/{id}/cancel` | myAppointments, cancelMine | own records, 2h policy |
| Owner | `GET/PATCH /admin/registrations/{id}` `{decision,basis,features}` | reviewRegistration | owner only, idempotent tenant creation, email verified first |
| Owner | `GET /admin/tenants` · `PATCH /admin/tenants/{slug}` | listTenants, setTenantStatus, setTenantPlan | owner sees metadata only |
| Owner | `GET/PUT /admin/plans/{key}` | savePlan | price ≥ 0, features list |
| Hospital | `GET/POST /employees` · `PATCH /employees/{id}/status` | listEmployees, inviteEmployee, setAccountStatus | admin only, same tenant only |
| Hospital | `GET/PATCH /tenant/profile` · `GET /tenant/setup` | updateTenantProfile, setupStatus | publish gate |
| Hospital | `GET/POST/PATCH/DELETE /{module}` (patients, appointments, doctors, …) | adapter `mockRequest` | role r/rw, plan feature (402), tenant status, audit log |

Example – book:
`POST /appointments {"hospital":"citycare","doctorId":"D-1","date":"2026-11-03","time":"09:30"}` → `201 {"data":{"ref":"APT-1005","status":"Confirmed"}}`; second request for the same slot → `409 {"code":"SLOT_TAKEN"}`.
Database essentials: `tenants`, `plans`, `plan_features`, `tenant_subscriptions`, `users` (+`memberships` for multi-hospital staff), `roles/permissions`, `doctors`, `schedules`, `appointments` (**unique doctor_id+start_time where status not cancelled**, `tenant_id` on every row, row-level security), `registrations`, `invitations`, `audit_log`, `outbox`.

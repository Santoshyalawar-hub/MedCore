# Flow-check script (do these in order; each step says what you should see)
Setup: open `standalone/index.html` (or `npm run dev`). Use a private window to start clean. Demo password for seeded accounts: `Demo@123`.
Because no mail server exists, every "email" is shown in **Platform Owner → Email Outbox**, and links also appear on screen labelled *Demo mode*.

## Demo 1 – Platform owner onboards a hospital
1. Home → **Register Your Hospital**. Fill the form (10-digit phone, plan, departments e.g. `General Medicine, Paediatrics`, tick consent) → Submit. *Expect:* application ID + "Demo mode: Verify email now".
2. Submitting the same name/email again → *"already registered"* (duplicate prevention).
3. Click **Verify email now** → *"Email verified. Your application is under review."*
4. Login as `admin@medcore.io` → **Hospital Applications** → Review → choose **Approve**, basis *Payment verified* → Save. *Expect:* "Hospital created" with activation link. (Approving before step 3 is refused: "has not verified its email".)
5. **Hospitals (Tenants)** shows the new hospital with a code `HSP-xxxx`, plan and status.

## Demo 2 – Hospital administrator
6. Open the activation link (or Email Outbox) → set a password (8+ chars, a number) → sign in with the representative's email. Re-using the link fails.
7. You land in the **Executive** layout → **Setup Wizard**. Checklist shows what is left. Try **Publish** now → refused with what is missing.
8. **Doctors & Schedule** → New: Name `Dr. Test`, Department, Qualification, Fee `500`, Days `Mon-Sat`, Hours `09:00-13:00`, Status Active.
9. Setup Wizard → fill description + operating hours → Save → **Publish to public website**.
10. **Employees & Roles** → Invite employee (doctor / nurse / receptionist) → open the demo link → set password.

## Demo 3 – Employee dashboards
11. Sign in as each new employee, plus seeded `doctor@citycare.com`, `nurse@citycare.com`, `reception@citycare.com`, `pharmacy@citycare.com`, `lab@citycare.com`, `accounts@citycare.com`, `hr@citycare.com`, `stores@citycare.com`. *Expect:* different layouts, sidebars and write/read-only buttons per role. Dashboards of seeded roles are labelled *Sample data*.

## Demo 4 – Patient journey
12. Home (logged out) → search by city/specialty → hospital cards → tick 2 hospitals → **Compare**. Open a hospital → doctors, fees, hours, next free slot, directions, policy, "No verified reviews yet".
13. **Book** → pick a date + slot → create a patient account (or `patient@citycare.com`) → **Confirm appointment**. *Expect:* reference number.
14. **My dashboard** → My Appointments shows it; Cancel works up to 2 hours before.

## Demo 5 – Hospital processes the appointment
15. Sign in as the hospital admin or receptionist → **Appointments** → the booking is there (notification bell shows it). Use the *Status…* dropdown: Checked-in → In progress → Completed. Doctor accounts see only their own patients.
16. Patient's page now shows *Completed*.

## Demo 6 – Isolation
17. Compare `admin@citycare.com` and your new hospital admin: different patients, appointments, staff, audit log. Editing the URL slug to another hospital → *403 Wrong workspace*.

## Demo 7 – Subscription
18. `admin@sunrise.com` (Basic plan): HR, Inventory, Reports show 🔒 / upgrade page; `admin@citycare.com` has them.
19. Owner → **Plans & Features**: change what a plan includes, or switch a hospital to **Custom** and pick features; the hospital's menu changes. Owner → **Suspend** a hospital: its staff cannot log in, it disappears from public search, writes are refused. **Activate** restores it.

## Demo 8 – Security & recovery
20. 5 wrong passwords → temporary lockout. **Forgot password** → reset link → new password works.
21. Hospital admin → Employees → **Deactivate** an employee → that login is refused.
22. Staff trying `/platform/...` or another tenant → 403 page. Idle 15 minutes → warning, then sign-out.

## Automated checks
`npm test` — 41 tests: every role × every module, the full onboarding→booking→processing→isolation→subscription→security flow, UI journey for booking, and all public pages.

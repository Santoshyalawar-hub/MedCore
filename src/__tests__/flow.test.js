import { it, expect } from "vitest";
import * as svc from "../mocks/service.js";
import { mockRequest as r } from "../mocks/adapter.js";
import { getTable } from "../mocks/adapter.js";
import { ymd } from "../shared/utils/index.js";
const owner = {
  role: "super_admin",
  name: "Owner",
  email: "admin@medcore.io",
  tenant: null,
};
const F = {
  name: "Lotus Care Hospital",
  type: "Multi-speciality",
  email: "admin@lotus.example",
  phone: "9876543210",
  address: "1 Main Rd",
  city: "Delhi",
  state: "Delhi",
  postal: "110001",
  repName: "Meera Joshi",
  repDesignation: "Director",
  plan: "starter",
  departments: "General Medicine, Paediatrics",
  consent: true,
};
const tok = (l) => l.split("/").pop();
const S = {};
const workday = () => {
  const d = new Date();
  do d.setDate(d.getDate() + 1);
  while (d.getDay() === 0);
  return ymd(d);
};
const code = async (p) => {
  try {
    await p;
  } catch (e) {
    return e.code || e.message;
  }
  return "OK";
};
it("Demo 1: registration → verification → owner approval → tenant + invitation (retry-safe, no duplicates)", () => {
  const reg = svc.registerHospital(F);
  S.reg = reg.id;
  expect(() => svc.registerHospital(F)).toThrow(/already registered/);
  expect(() =>
    svc.reviewRegistration(owner, reg.id, {
      decision: "approve",
      basis: "payment",
    }),
  ).toThrow(/not verified/);
  svc.verifyEmail(tok(reg.demoLink));
  expect(() =>
    svc.reviewRegistration(
      { role: "hospital_admin", tenant: "citycare" },
      reg.id,
      { decision: "approve", basis: "payment" },
    ),
  ).toThrow(/owner/i);
  expect(() =>
    svc.reviewRegistration(owner, reg.id, { decision: "approve" }),
  ).toThrow(/activated/);
  const a = svc.reviewRegistration(owner, reg.id, {
    decision: "approve",
    basis: "payment",
  });
  S.slug = a.slug;
  S.act = tok(a.demoLink);
  expect(
    svc.reviewRegistration(owner, reg.id, {
      decision: "approve",
      basis: "payment",
    }).slug,
  ).toBe(a.slug); // retry → same tenant
  expect(svc.listTenants(owner).filter((t) => t.name === F.name).length).toBe(
    1,
  );
  expect(() => svc.loginAccount(F.email, "anything1")).toThrow(/not activated/);
});
it("Demo 2: admin activates (single-use link), cannot publish until ready, then publishes", async () => {
  svc.acceptToken("activate", S.act, "Strong@123");
  expect(() => svc.acceptToken("activate", S.act, "Strong@123")).toThrow(
    /invalid|expired/,
  );
  S.admin = svc.loginAccount(F.email, "Strong@123");
  expect(S.admin.role).toBe("hospital_admin");
  expect(S.admin.tenant).toBe(S.slug);
  expect(svc.listHospitals({}).some((h) => h.slug === S.slug)).toBe(false);
  expect(() => svc.updateTenantProfile(S.admin, { published: true })).toThrow(
    /Before publishing/,
  );
  await r(
    "POST",
    "/doctors",
    S.slug,
    {
      row: [
        "D-1",
        "Dr. Test",
        "General Medicine",
        "MBBS",
        500,
        "Mon-Sat",
        "09:00-13:00",
        "Active",
      ],
    },
    "Admin",
    "hospital_admin",
  );
  svc.updateTenantProfile(S.admin, {
    description: "Test hospital",
    hours: "Mon–Sat 09:00–13:00",
    published: true,
  });
  expect(svc.listHospitals({}).some((h) => h.slug === S.slug)).toBe(true);
  expect(
    svc.listHospitals({ specialty: "Paediatrics", city: "Delhi" }).length,
  ).toBeGreaterThan(0);
});
it("Demo 4/5: patient books, double-booking is rejected, hospital processes the appointment", async () => {
  svc.registerPatient({
    name: "Pat One",
    email: "p1@example.com",
    phone: "9000000001",
    password: "Patient@123",
  });
  svc.registerPatient({
    name: "Pat Two",
    email: "p2@example.com",
    phone: "9000000002",
    password: "Patient@123",
  });
  const p1 = svc.loginAccount("p1@example.com", "Patient@123"),
    p2 = svc.loginAccount("p2@example.com", "Patient@123");
  const date = workday();
  const slot = svc.getSlots(S.slug, "D-1", date).find((s) => s.free);
  const b = svc.bookAppointment(p1, {
    slug: S.slug,
    doctorId: "D-1",
    date,
    time: slot.time,
  });
  expect(b.status).toBe("Confirmed");
  expect(
    await code(
      Promise.resolve().then(() =>
        svc.bookAppointment(p2, {
          slug: S.slug,
          doctorId: "D-1",
          date,
          time: slot.time,
        }),
      ),
    ),
  ).toBe("SLOT_TAKEN");
  expect(() =>
    svc.bookAppointment(S.admin, {
      slug: S.slug,
      doctorId: "D-1",
      date,
      time: slot.time,
    }),
  ).toThrow(/patient/);
  expect(svc.notices(S.admin).length).toBe(1);
  expect(svc.myAppointments(p1)[0].ref).toBe(b.ref);
  expect(svc.myAppointments(p2).length).toBe(0);
  const row = getTable("appointments", S.slug).rows.find((x) => x[0] === b.ref);
  for (const st of ["Checked-in", "In progress", "Completed"])
    await r(
      "PATCH",
      "/appointments/" + b.ref,
      S.slug,
      { row: [...row.slice(0, 5), st, row[6]] },
      "Admin",
      "hospital_admin",
    );
  expect(
    getTable("appointments", S.slug).rows.find((x) => x[0] === b.ref)[5],
  ).toBe("Completed");
  expect(() => svc.cancelMine(p1, S.slug, b.ref)).toThrow(/no longer/);
});
it("Demo 6: tenants are isolated from each other", async () => {
  const cc = (
      await r("GET", "/appointments", "citycare", null, "x", "hospital_admin")
    ).rows,
    lo = (await r("GET", "/appointments", S.slug, null, "x", "hospital_admin"))
      .rows;
  expect(cc.some((x) => x[6] === "p1@example.com")).toBe(false);
  expect(lo.some((x) => x[0] === "APT-501")).toBe(false);
  expect(
    (await r("GET", "/patients", S.slug, null, "x", "hospital_admin")).rows
      .length,
  ).toBe(0);
  expect(() =>
    svc.setAccountStatus({ ...S.admin }, "doctor@citycare.com", "deactivated"),
  ).toThrow(/not found/i);
});
it("Demo 7: plan entitlements and permissions are enforced on the data API", async () => {
  expect(
    await code(r("GET", "/inventory", S.slug, null, "x", "hospital_admin")),
  ).toBe("PLAN_REQUIRED");
  expect(
    await code(r("GET", "/inventory", "citycare", null, "x", "hospital_admin")),
  ).toBe("OK");
  expect(
    await code(r("DELETE", "/patients/P-1001", "citycare", null, "x", "nurse")),
  ).toBe("FORBIDDEN");
  expect(await code(r("GET", "/billing", "citycare", null, "x", "nurse"))).toBe(
    "FORBIDDEN",
  );
  expect(
    await code(r("GET", "/accounts", "citycare", null, "x", "hospital_admin")),
  ).toBe("NOT_FOUND");
  svc.setTenantPlan(owner, S.slug, "custom", ["core", "inventory"]);
  expect(
    await code(r("GET", "/inventory", S.slug, null, "x", "hospital_admin")),
  ).toBe("OK");
  expect(() => svc.setTenantPlan(owner, S.slug, "custom", [])).toThrow(
    /features/,
  );
  svc.setTenantStatus(owner, S.slug, "suspended");
  expect(() => svc.loginAccount(F.email, "Strong@123")).toThrow(/not active/);
  expect(
    await code(
      r(
        "POST",
        "/doctors",
        S.slug,
        { row: ["D-9", "x", "x", "x", 1, "Mon-Fri", "09:00-13:00", "Active"] },
        "A",
        "hospital_admin",
      ),
    ),
  ).toBe("SUBSCRIPTION_INACTIVE");
  expect(svc.listHospitals({}).some((h) => h.slug === S.slug)).toBe(false);
  svc.setTenantStatus(owner, S.slug, "active");
  svc.loginAccount(F.email, "Strong@123");
});
it("Demo 3/8: employee invitation, role dashboards, deactivation, password reset, lockout", () => {
  const inv = svc.inviteEmployee(S.admin, {
    name: "Dr. Invited",
    email: "doc@lotus.example",
    role: "doctor",
    dept: "General Medicine",
  });
  expect(() =>
    svc.inviteEmployee(
      { role: "nurse", tenant: S.slug },
      { name: "X Y", email: "x@y.com", role: "nurse" },
    ),
  ).toThrow(/administrator/);
  expect(() => svc.loginAccount("doc@lotus.example", "Whatever1")).toThrow(
    /not activated/,
  );
  svc.acceptToken("activate", tok(inv.demoLink), "Doctor@123");
  const d = svc.loginAccount("doc@lotus.example", "Doctor@123");
  expect(d.role).toBe("doctor");
  expect(
    getTable("doctors", S.slug).rows.some(
      (x) => x[1] === "Dr. Invited" && x[7] === "Inactive",
    ),
  ).toBe(true);
  svc.setAccountStatus(S.admin, "doc@lotus.example", "deactivated");
  expect(() => svc.loginAccount("doc@lotus.example", "Doctor@123")).toThrow(
    /deactivated/,
  );
  const rs = svc.requestReset("p2@example.com");
  svc.acceptToken("reset", tok(rs.demoLink), "NewPass@123");
  svc.loginAccount("p2@example.com", "NewPass@123");
  expect(svc.requestReset("nobody@x.com").demoLink).toBeUndefined();
  for (let i = 0; i < 5; i++)
    try {
      svc.loginAccount("p1@example.com", "wrong");
    } catch {}
  expect(() => svc.loginAccount("p1@example.com", "Patient@123")).toThrow(
    /Too many/,
  );
  svc.requestDemo({
    name: "A B",
    org: "Org",
    email: "a@b.com",
    phone: "9999999999",
    preference: "Next week",
    consent: true,
  });
  expect(svc.listDemos(owner).length).toBe(1);
  expect(svc.liveMetrics(S.admin).kpis.length).toBe(4);
});

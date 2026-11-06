// Simulated backend database (browser localStorage). Replaced by a real DB + API; see docs/API.md.
import { DB } from "./db.js";
import { PLANS } from "../config/plans.js";
const K = "hms_platform";
let mem = null;
export const uid = (p = "") =>
  p +
  Math.random().toString(36).slice(2, 10) +
  Date.now().toString(36).slice(-4);
export const hash = (s) => {
  let h = 5381;
  for (const c of "medcore:" + s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
  return "demo$" + h.toString(16);
}; // DEMO ONLY: a real backend uses argon2/bcrypt
const T = (slug, code, name, type, city, state, plan, extra) => ({
  slug,
  code,
  name,
  type,
  city,
  state,
  email: `info@${slug}.example`,
  phone: "0800000000",
  plan,
  status: "active",
  subscription: "contract",
  published: true,
  autoConfirm: true,
  profileConfirmed: true,
  workflowsReviewed: true,
  ...extra,
});
const seed = () => ({
  plans: {
    starter: {
      name: "Basic",
      price: 24999,
      cycle: "month",
      features: [...PLANS.starter.features],
    },
    professional: {
      name: "Professional",
      price: 74999,
      cycle: "month",
      features: [...PLANS.professional.features],
    },
    enterprise: {
      name: "Enterprise",
      price: null,
      cycle: "custom quote",
      features: [...PLANS.enterprise.features],
    },
    custom: {
      name: "Custom",
      price: null,
      cycle: "negotiated",
      features: [],
      custom: true,
    },
  },
  tenants: {
    citycare: T(
      "citycare",
      "HSP-1001",
      "CityCare Hospitals",
      "Multi-speciality",
      "Bengaluru",
      "Karnataka",
      "enterprise",
      {
        description: "Multi-specialty hospital serving the community.",
        hours: "Mon–Sat 09:00–17:00",
        services: [
          "Outpatient consultations",
          "Diagnostics & laboratory",
          "Pharmacy",
          "Inpatient admissions",
        ],
      },
    ),
    sunrise: T(
      "sunrise",
      "HSP-1002",
      "Sunrise Clinic",
      "Clinic",
      "Pune",
      "Maharashtra",
      "starter",
      {
        description: "Community clinic offering primary care services.",
        hours: "Mon–Sat 09:00–13:00",
        services: ["Outpatient consultations", "Pharmacy"],
      },
    ),
  },
  registrations: [],
  invitations: [],
  demos: [],
  outbox: [],
  notices: [],
  attempts: {},
  accounts: DB.accounts.map((a) => ({
    email: a.email,
    name: a.name,
    role: a.role,
    tenant: a.tenant,
    status: "active",
    hash: hash(a.password),
  })),
});
export const load = () => {
  if (!mem) {
    try {
      mem = JSON.parse(localStorage.getItem(K));
    } catch {}
    if (!mem) mem = seed();
  }
  return mem;
};
export const save = () => localStorage.setItem(K, JSON.stringify(mem));
export const getPlans = () => load().plans;
export const resetAll = () => {
  mem = null;
  Object.keys(localStorage)
    .filter((k) => k.startsWith("hms_"))
    .forEach((k) => localStorage.removeItem(k));
};

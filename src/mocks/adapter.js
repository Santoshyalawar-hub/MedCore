// Mock backend for table modules: tenant-scoped, persisted, and it ENFORCES role, plan and tenant-status rules like a real API would.
import { DB, SUN } from "./db.js";
import { AppError } from "../core/errors.js";
import { load } from "./store.js";
import { ROLES } from "../config/roles.js";
import { MODULES } from "../config/modules.js";
import { hasFeature } from "../core/rbac.js";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const scope = (k, t) => (k === "platformAudit" ? "platform" : t || "platform");
const read = (s) => {
  try {
    return JSON.parse(localStorage.getItem("hms_data_" + s)) || {};
  } catch {
    return {};
  }
};
const seedFor = (k, t) =>
  t === "citycare"
    ? DB[k]
    : t === "sunrise" && SUN[k]
      ? SUN[k]
      : DB[k]?.cols
        ? { cols: DB[k].cols, rows: [] }
        : DB[k];
export const getTable = (k, t) => read(scope(k, t))[k] || seedFor(k, t);
export const setTable = (k, t, tb) => {
  const s = scope(k, t),
    o = read(s);
  o[k] = tb;
  localStorage.setItem("hms_data_" + s, JSON.stringify(o));
};
export function logAudit(t, actor, action, res) {
  const k = t ? "audit" : "platformAudit",
    tb = getTable(k, t);
  setTable(k, t, {
    ...tb,
    rows: [
      [new Date().toTimeString().slice(0, 5), actor, action, res, "Logged"],
      ...tb.rows,
    ],
  });
}
export async function mockRequest(method, path, t, body, actor, role) {
  await wait(120);
  const [, key, id] = path.split("/");
  if (!(key in DB) || !MODULES[key])
    throw new AppError(404, "NOT_FOUND", "Resource not found");
  if (role) {
    const a = ROLES[role]?.access[key],
      tn = t && load().tenants[t],
      m = MODULES[key];
    if (!a)
      throw new AppError(
        403,
        "FORBIDDEN",
        "Your role cannot access this resource",
      );
    if (method !== "GET" && a !== "rw")
      throw new AppError(403, "FORBIDDEN", "Read-only for your role");
    if (tn && !hasFeature(tn, m.feature))
      throw new AppError(
        402,
        "PLAN_REQUIRED",
        "Not included in your subscription plan",
      );
    if (tn && method !== "GET" && tn.status !== "active")
      throw new AppError(
        403,
        "SUBSCRIPTION_INACTIVE",
        "Subscription is not active",
      );
  }
  const tb = getTable(key, t);
  if (method === "GET") return tb;
  if (!tb?.cols) throw new AppError(405, "METHOD", "Not allowed");
  let rows = tb.rows;
  const row = body?.row,
    rid = id && decodeURIComponent(id);
  if (method === "POST") {
    if (
      rows.some(
        (r) => String(r[0]).toLowerCase() === String(row[0]).toLowerCase(),
      )
    )
      throw new AppError(409, "CONFLICT", `“${row[0]}” already exists`);
    rows = [row, ...rows];
  }
  if (method === "PATCH")
    rows = rows.map((r) => (String(r[0]) === rid ? row : r));
  if (method === "DELETE") rows = rows.filter((r) => String(r[0]) !== rid);
  setTable(key, t, { ...tb, rows });
  if (key !== "audit" && key !== "platformAudit")
    logAudit(
      t,
      actor,
      method === "POST" ? "CREATE" : method === "PATCH" ? "UPDATE" : "DELETE",
      `${key} ${row ? row[0] : rid}`,
    );
  return { ok: true };
}

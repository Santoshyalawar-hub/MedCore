import { it, expect } from "vitest";
import { mockRequest as r } from "../mocks/adapter.js";
it("create / update / delete are persisted, tenant-scoped and audit-logged; duplicates return 409", async () => {
  await r(
    "POST",
    "/patients",
    "citycare",
    { row: ["P-9001", "Test User", 30, "OPD", "Active"] },
    "Tester",
    "hospital_admin",
  );
  expect(
    (await r("GET", "/patients", "citycare", null, "x", "hospital_admin"))
      .rows[0][0],
  ).toBe("P-9001");
  expect(
    (
      await r("GET", "/patients", "sunrise", null, "x", "hospital_admin")
    ).rows.some((x) => x[0] === "P-9001"),
  ).toBe(false);
  await expect(
    r(
      "POST",
      "/patients",
      "citycare",
      { row: ["P-9001", "Dup", 1, "OPD", "Active"] },
      "T",
      "hospital_admin",
    ),
  ).rejects.toMatchObject({ status: 409 });
  await r(
    "PATCH",
    "/patients/P-9001",
    "citycare",
    { row: ["P-9001", "Test User", 31, "ICU", "Admitted"] },
    "Tester",
    "hospital_admin",
  );
  expect(
    (await r("GET", "/patients", "citycare", null, "x", "hospital_admin"))
      .rows[0][3],
  ).toBe("ICU");
  await r(
    "DELETE",
    "/patients/P-9001",
    "citycare",
    null,
    "Tester",
    "hospital_admin",
  );
  expect(
    (
      await r("GET", "/patients", "citycare", null, "x", "hospital_admin")
    ).rows.some((x) => x[0] === "P-9001"),
  ).toBe(false);
  expect(
    (
      await r("GET", "/audit", "citycare", null, "x", "hospital_admin")
    ).rows.filter((x) => x[3] === "patients P-9001").length,
  ).toBe(3);
});

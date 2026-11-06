import { it, expect, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Providers } from "../app/Providers.jsx";
import App from "../app/App.jsx";
import { ymd } from "../shared/utils/index.js";
afterEach(cleanup);
const R = (p) =>
  render(
    <MemoryRouter initialEntries={[p]}>
      <Providers>
        <App />
      </Providers>
    </MemoryRouter>,
  );
it("the default route is the public homepage (not login) with the required sections", () => {
  sessionStorage.clear();
  const { container: c } = R("/");
  expect(c.querySelector("input[type=password]")).toBeNull();
  for (const t of [
    "Find Hospitals",
    "Find Doctors",
    "Specialties & Services",
    "How It Works",
    "About Us",
    "Contact",
    "Login",
    "Request a Demo",
    "Register Your Hospital",
    "Featured Hospitals",
    "Subscription Plans",
    "Privacy Policy",
  ])
    expect(c.textContent).toContain(t);
});
for (const p of [
  "/hospitals",
  "/hospitals/citycare",
  "/hospitals/sunrise",
  "/doctors",
  "/compare?ids=citycare,sunrise",
  "/services",
  "/how-it-works",
  "/about",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/register-hospital",
  "/request-demo",
  "/signup",
  "/login",
  "/forgot-password",
])
  it("public route renders: " + p, () => {
    sessionStorage.clear();
    const { container: c } = R(p);
    expect(c.textContent).not.toContain("Something went wrong");
    expect(c.textContent.length).toBeGreaterThan(30);
  });
it("UI journey: pick slot → sign in as patient → confirm → appears in My Appointments", async () => {
  sessionStorage.clear();
  const { container: c } = R("/book/citycare/D-1");
  const d = new Date();
  do d.setDate(d.getDate() + 1);
  while (d.getDay() === 0);
  fireEvent.change(c.querySelector("#sp-date"), { target: { value: ymd(d) } });
  const slot = [...c.querySelectorAll("[role=group] button")].find(
    (b) => !b.disabled,
  );
  fireEvent.click(slot);
  fireEvent.change(c.querySelector("input[type=email]"), {
    target: { value: "patient@citycare.com" },
  });
  fireEvent.change(c.querySelector("input[type=password]"), {
    target: { value: "Demo@123" },
  });
  const sign = screen.getAllByRole("button", { name: "Sign in" });
  fireEvent.click(sign[sign.length - 1]);
  fireEvent.click(
    await screen.findByRole("button", { name: "Confirm appointment" }),
  );
  await waitFor(() => expect(c.textContent).toContain("Appointment confirmed"));
  cleanup();
  const m = R("/me/myAppointments");
  await waitFor(() =>
    expect(m.container.textContent).toContain("CityCare Hospitals"),
  );
  expect(m.container.textContent).toContain("Dr. Asha Rao");
});

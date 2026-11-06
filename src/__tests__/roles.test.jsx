import { it, expect, afterEach } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Providers } from "../app/Providers.jsx";
import App from "../app/App.jsx";
import { DB } from "../mocks/db.js";
import { navFor, basePath } from "../core/rbac.js";
afterEach(cleanup);
// Every role can open every module in its own sidebar without crashing (data, upgrade or forbidden states all render).
for (const a of DB.accounts)
  it(`${a.role} @ ${a.tenant || "platform"}: all sidebar modules render`, async () => {
    const u = { ...a };
    delete u.password;
    sessionStorage.setItem("hms_session", JSON.stringify(u));
    for (const k of navFor(u)) {
      const { container, unmount } = render(
        <MemoryRouter initialEntries={[`${basePath(u)}/${k}`]}>
          <Providers>
            <App />
          </Providers>
        </MemoryRouter>,
      );
      await waitFor(
        () => expect(container.querySelector("[aria-busy]")).toBeNull(),
        { timeout: 3000 },
      );
      expect(container.textContent).not.toContain("Something went wrong");
      expect(container.textContent.length).toBeGreaterThan(40);
      unmount();
    }
  });
it("blocks access to another tenant's workspace", () => {
  const u = { ...DB.accounts[1] };
  delete u.password;
  sessionStorage.setItem("hms_session", JSON.stringify(u));
  const { container } = render(
    <MemoryRouter initialEntries={["/t/sunrise/dashboard"]}>
      <Providers>
        <App />
      </Providers>
    </MemoryRouter>,
  );
  expect(container.textContent).toContain("403");
});

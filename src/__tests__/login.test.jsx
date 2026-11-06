import { it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Providers } from "../app/Providers.jsx";
import App from "../app/App.jsx";
it("logs in through the form with email + password and reaches the dashboard", async () => {
  sessionStorage.clear();
  const { container } = render(
    <MemoryRouter initialEntries={["/login"]}>
      <Providers>
        <App />
      </Providers>
    </MemoryRouter>,
  );
  const [email, pw] = container.querySelectorAll("input");
  fireEvent.change(email, { target: { value: "admin@citycare.com" } });
  fireEvent.change(pw, { target: { value: "Demo@123" } });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  await waitFor(() =>
    expect(container.textContent).toContain("Hospital Administrator"),
  );
  expect(container.textContent).toContain("Pending approvals");
});

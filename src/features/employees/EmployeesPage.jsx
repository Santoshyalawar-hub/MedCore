import { useState } from "react";
import { Link } from "react-router-dom";
import * as svc from "../../mocks/service.js";
import { useAuth } from "../../core/auth/AuthContext.jsx";
import { can } from "../../core/rbac.js";
import { ROLES, STAFF_ROLES } from "../../config/roles.js";
import { Card, Pill } from "../../shared/ui/index.jsx";
import Modal from "../../shared/ui/Modal.jsx";
import { useToast } from "../notifications/ToastContext.jsx";
export default function EmployeesPage() {
  const { user } = useAuth(),
    toast = useToast(),
    [, b] = useState(0),
    bump = () => b((x) => x + 1),
    [f, setF] = useState(null),
    [res, setRes] = useState(null);
  const w = can(user, "users", "write"),
    rows = svc.listEmployees(user);
  const invite = (e) => {
    e.preventDefault();
    try {
      setRes(svc.inviteEmployee(user, f));
      setF(null);
      bump();
    } catch (x) {
      toast(x.message, "err");
    }
  };
  const st = (email, s) => {
    try {
      svc.setAccountStatus(user, email, s);
      bump();
      toast("Updated");
    } catch (x) {
      toast(x.message, "err");
    }
  };
  return (
    <Card
      title="Employees & roles"
      action={
        w ? (
          <button
            className="btn"
            onClick={() =>
              setF({ name: "", email: "", role: "doctor", dept: "", empId: "" })
            }
          >
            ＋ Invite employee
          </button>
        ) : (
          <span className="pill bg-slate-100">Read-only</span>
        )
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              {[
                "Name",
                "Email",
                "Role",
                "Emp ID",
                "Department",
                "Status",
                "",
              ].map((c) => (
                <th key={c} className="py-2 pr-4">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.email} className="border-t">
                <td className="py-2 pr-4">{r.name}</td>
                <td>{r.email}</td>
                <td>{ROLES[r.role].label}</td>
                <td>{r.empId}</td>
                <td>{r.dept}</td>
                <td>
                  <Pill>
                    {r.status === "deactivated"
                      ? "Suspended"
                      : r.status === "invited"
                        ? "Pending"
                        : "Active"}
                  </Pill>
                </td>
                <td>
                  {w &&
                    r.email !== user.email &&
                    r.status !== "invited" &&
                    (r.status === "active" ? (
                      <button
                        className="btn-o !text-red-700"
                        onClick={() => st(r.email, "deactivated")}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn-o"
                        onClick={() => st(r.email, "active")}
                      >
                        Reactivate
                      </button>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 mt-3">
        Employees receive a time-limited activation link and set their own
        password. Doctors are added to “Doctors & Schedule” as inactive until
        fee and hours are configured.
      </p>
      {f && (
        <Modal title="Invite employee" onClose={() => setF(null)}>
          <form onSubmit={invite} className="space-y-3" noValidate>
            {[
              ["name", "Full name"],
              ["email", "Official email"],
              ["empId", "Employee ID (optional)"],
              ["dept", "Department (optional)"],
            ].map(([k, l]) => (
              <div key={k}>
                <label className="lbl">{l}</label>
                <input
                  className="input"
                  type={k === "email" ? "email" : "text"}
                  value={f[k]}
                  onChange={(e) => setF({ ...f, [k]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <label className="lbl">Role</label>
              <select
                className="input"
                value={f.role}
                onChange={(e) => setF({ ...f, role: e.target.value })}
              >
                {STAFF_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLES[r].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn-o"
                onClick={() => setF(null)}
              >
                Cancel
              </button>
              <button className="btn">Send invitation</button>
            </div>
          </form>
        </Modal>
      )}
      {res && (
        <Modal title="Invitation sent" onClose={() => setRes(null)}>
          <p className="text-sm">
            An activation email was queued for the employee.
          </p>
          {res.demoLink && (
            <p className="text-sm mt-2 bg-amber-50 rounded p-2">
              Activation link:{" "}
              <Link
                className="underline"
                to={res.demoLink.split("#")[1]}
                onClick={() => setRes(null)}
              >
                open activation page
              </Link>{" "}
              (opening it signs you out of nothing — it just sets the employee's
              password).
            </p>
          )}
        </Modal>
      )}
    </Card>
  );
}

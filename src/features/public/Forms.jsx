import { useState, useEffect, useRef } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import * as svc from "../../mocks/service.js";
import { getPlans } from "../../mocks/store.js";
import { Wrap, money, PatientAuth } from "./shared.jsx";
import { Msg } from "../modules/ModulePage.jsx";
import AuthLayout from "../../layouts/AuthLayout.jsx";
const F = ({ l, k, v, set, t = "text", req = true, opts, er }) => (
  <div>
    <label className="lbl">
      {l}
      {req && " *"}
    </label>
    {opts ? (
      <select
        className="input"
        value={v[k] || ""}
        onChange={(e) => set({ ...v, [k]: e.target.value })}
      >
        <option value="">Selectâ€¦</option>
        {opts.map((o) =>
          Array.isArray(o) ? (
            <option key={o[0]} value={o[0]}>
              {o[1]}
            </option>
          ) : (
            <option key={o}>{o}</option>
          ),
        )}
      </select>
    ) : t === "area" ? (
      <textarea
        className="input"
        rows="2"
        value={v[k] || ""}
        onChange={(e) => set({ ...v, [k]: e.target.value })}
      />
    ) : (
      <input
        className="input"
        type={t}
        value={v[k] || ""}
        onChange={(e) => set({ ...v, [k]: e.target.value })}
      />
    )}
  </div>
);
const Consent = ({ v, set, text }) => (
  <label className="flex gap-2 text-sm">
    <input
      type="checkbox"
      checked={!!v.consent}
      onChange={(e) => set({ ...v, consent: e.target.checked })}
    />{" "}
    {text}
  </label>
);
const DemoLink = ({ l, label }) =>
  l ? (
    <p className="mt-3 text-sm bg-amber-50 text-amber-900 rounded-lg p-3">
      Continue securely: {" "}
      <Link className="underline font-medium" to={l.split("#")[1]}>
        {label}
      </Link>
    </p>
  ) : null;
export function RegisterHospital() {
  const [sp] = useSearchParams();
  const [v, set] = useState({ plan: sp.get("plan") || "" });
  const [er, setEr] = useState("");
  const [done, setDone] = useState(null);
  const plans = Object.entries(getPlans()).map(([k, p]) => [
    k,
    `${p.name} â€“ ${p.price != null ? money(p.price) + " / " + p.cycle : p.cycle}`,
  ]);
  const submit = (e) => {
    e.preventDefault();
    try {
      setDone(svc.registerHospital(v));
    } catch (x) {
      setEr(x.message);
    }
  };
  if (done)
    return (
      <Wrap narrow>
        <div className="card">
          <h1 className="text-xl font-bold">
            âœ… Application {done.id} submitted
          </h1>
          <p className="text-sm mt-2">
            We sent a verification email to <b>{v.email}</b>. After you verify
            it, our team reviews your application. You will receive an
            activation link by email once approved.
          </p>
          <DemoLink l={done.demoLink} label="Verify email now" />
        </div>
      </Wrap>
    );
  return (
    <Wrap narrow>
      <h1 className="text-2xl font-bold mb-1">Register your hospital</h1>
      <p className="text-sm text-slate-600 mb-4">
        Collected only for verification and onboarding. Subscription is
        activated after verification and payment/contract confirmation â€” not by
        submitting this form.
      </p>
      <form onSubmit={submit} className="card space-y-3" noValidate>
        <F l="Hospital legal / registered name" k="name" v={v} set={set} />
        <F
          l="Hospital type"
          k="type"
          v={v}
          set={set}
          opts={[
            "Multi-speciality",
            "Single-speciality",
            "Clinic",
            "Nursing home",
            "Diagnostic centre",
          ]}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <F l="Registered email" k="email" t="email" v={v} set={set} />
          <F
            l="Official contact number (10 digits)"
            k="phone"
            t="tel"
            v={v}
            set={set}
          />
        </div>
        <F l="Address" k="address" v={v} set={set} />
        <div className="grid sm:grid-cols-3 gap-3">
          <F l="City" k="city" v={v} set={set} />
          <F l="State" k="state" v={v} set={set} />
          <F l="Postal code" k="postal" v={v} set={set} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <F l="Authorised representative" k="repName" v={v} set={set} />
          <F l="Designation" k="repDesignation" v={v} set={set} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <F l="Website" k="website" t="url" req={false} v={v} set={set} />
          <F
            l="Registration / licence no."
            k="license"
            req={false}
            v={v}
            set={set}
          />
        </div>
        <F
          l="Departments & specialties (comma separated)"
          k="departments"
          t="area"
          v={v}
          set={set}
        />
        <F l="Preferred plan" k="plan" v={v} set={set} opts={plans} />
        <Consent
          v={v}
          set={set}
          text="I confirm the information is accurate and accept the Terms and Privacy Policy."
        />
        {er && (
          <p className="err" role="alert">
            {er}
          </p>
        )}
        <button className="btn w-full">Submit application</button>
      </form>
    </Wrap>
  );
}
export function RequestDemo() {
  const [v, set] = useState({});
  const [er, setEr] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    try {
      svc.requestDemo(v);
      setDone(true);
    } catch (x) {
      setEr(x.message);
    }
  };
  if (done)
    return (
      <Wrap narrow>
        <div className="card">
          <h1 className="text-xl font-bold">âœ… Enquiry received</h1>
          <p className="text-sm mt-2">
            Thank you. Our team will contact you at {v.email} about your
            preferred time.
          </p>
        </div>
      </Wrap>
    );
  return (
    <Wrap narrow>
      <h1 className="text-2xl font-bold mb-4">Contact Sales</h1>
      <form onSubmit={submit} className="card space-y-3" noValidate>
        <div className="grid sm:grid-cols-2 gap-3">
          <F l="Your name" k="name" v={v} set={set} />
          <F l="Organisation" k="org" v={v} set={set} />
          <F l="Business email" k="email" t="email" v={v} set={set} />
          <F l="Phone" k="phone" t="tel" v={v} set={set} />
        </div>
        <F l="Preferred contact date / time" k="preference" v={v} set={set} />
        <Consent
          v={v}
          set={set}
          text="I agree to be contacted about this request."
        />
        {er && (
          <p className="err" role="alert">
            {er}
          </p>
        )}
        <button className="btn w-full">Send Enquiry</button>
      </form>
    </Wrap>
  );
}
export function TokenPage({ kind }) {
  const { token } = useParams();
  const [pw, setPw] = useState("");
  const [st, setSt] = useState(kind === "verify" ? "working" : "form");
  const [msg, setMsg] = useState("");
  const ran = useRef(false);
  useEffect(() => {
    if (kind === "verify" && !ran.current) {
      ran.current = true;
      try {
        svc.verifyEmail(token);
        setSt("ok");
      } catch (e) {
        setMsg(e.message);
        setSt("err");
      }
    }
  }, []); // eslint-disable-line
  const submit = (e) => {
    e.preventDefault();
    try {
      svc.acceptToken(kind, token, pw);
      setSt("ok");
    } catch (x) {
      setMsg(x.message);
      setSt("err2");
    }
  };
  const title = {
    activate: "Activate your account",
    reset: "Set a new password",
    verify: "Email verification",
  }[kind];
  return (
    <AuthLayout>
      <div className="card max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-3">{title}</h1>
        {st === "ok" && (
          <>
            <p className="text-green-700">
              âœ”{" "}
              {kind === "verify"
                ? "Email verified. Your application is now under review."
                : "Done. You can now sign in."}
            </p>
            <Link className="btn mt-4" to={kind === "verify" ? "/" : "/login"}>
              {kind === "verify" ? "Back to home" : "Go to sign in"}
            </Link>
          </>
        )}
        {st === "err" && (
          <p className="err" role="alert">
            {msg}
          </p>
        )}
        {st === "working" && <p>Verifyingâ€¦</p>}
        {(st === "form" || st === "err2") && (
          <form onSubmit={submit} className="space-y-3" noValidate>
            <div>
              <label className="lbl">New password</label>
              <input
                type="password"
                className="input"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="new-password"
              />
              <p className="text-xs text-slate-500">
                At least 8 characters including a number.
              </p>
            </div>
            {st === "err2" && (
              <p className="err" role="alert">
                {msg}
              </p>
            )}
            <button className="btn w-full">Save password</button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
export function Forgot() {
  const [e, setE] = useState("");
  const [r, setR] = useState(null);
  return (
    <AuthLayout>
      <form
        className="card max-w-md mx-auto space-y-3"
        onSubmit={(x) => {
          x.preventDefault();
          setR(svc.requestReset(e));
        }}
      >
        <h1 className="text-xl font-bold">Forgot password</h1>
        <input
          className="input"
          type="email"
          aria-label="Email"
          placeholder="Your account email"
          value={e}
          onChange={(x) => setE(x.target.value)}
        />
        <button className="btn w-full">Send reset link</button>
        {r && (
          <p className="text-sm">
            If an account exists for that email, a reset link has been sent.
          </p>
        )}
        {r && <DemoLink l={r.demoLink} label="Open reset link" />}
        <Link to="/login" className="text-sm underline">
          Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}
export function PatientSignup() {
  const go = useNavigate();
  return (
    <Wrap>
      <h1 className="text-2xl font-bold mb-4">Patient account</h1>
      <PatientAuth start="register" onDone={() => go("/me/dashboard")} />
    </Wrap>
  );
}

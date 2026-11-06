import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import * as svc from "../../mocks/service.js";
import { ymd } from "../../shared/utils/index.js";
import { useAuth } from "../../core/auth/AuthContext.jsx";
import { Clip, Photo } from "../../shared/ui/index.jsx";
import { photos } from "../../config/media.js";
export const Wrap = ({ children, narrow }) => (
  <div
    className={
      "mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 " +
      (narrow ? "max-w-2xl" : "max-w-7xl")
    }
  >
    {children}
  </div>
);
export const money = (n) =>
  n == null ? "On request" : "₹" + Number(n).toLocaleString("en-IN");
const IC = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  clipboard: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 13h6M9 17h4" />
    </>
  ),
  tag: (
    <>
      <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7" cy="7" r="1" />
    </>
  ),
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  building: (
    <>
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5" />
      <path d="M12 8v4M10 10h4" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  network: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path d="M12 7.5v4M12 11.5l-6 5.5M12 11.5l6 5.5" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
  ),
  steth: (
    <>
      <path d="M5 3v6a4 4 0 0 0 8 0V3M9 13v2a5 5 0 0 0 10 0v-2" />
      <circle cx="19" cy="11" r="2" />
    </>
  ),
  flask: (
    <path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3" />
  ),
  bed: <path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" />,
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01" />
    </>
  ),
  play: <path d="M7 4.5v15l12-7.5z" />,
  pause: (
    <>
      <rect x="6" y="4.5" width="4" height="15" rx="1" />
      <rect x="14" y="4.5" width="4" height="15" rx="1" />
    </>
  ),
};
export const Icon = ({ n, className = "w-5 h-5", solid }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill={solid ? "currentColor" : "none"}
    stroke={solid ? "none" : "currentColor"}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {IC[n]}
  </svg>
);
export const deptIcon = (d) =>
  /cardi/i.test(d)
    ? "heart"
    : /neuro/i.test(d)
      ? "network"
      : /ortho/i.test(d)
        ? "activity"
        : /paed|pedi/i.test(d)
          ? "smile"
          : /lab|patholog/i.test(d)
            ? "flask"
            : "steth";
export const initials = (s) =>
  String(s || "")
    .replace(/^Dr\.?\s+/i, "")
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "MC";
export function HospitalCard({ h, i = 0, compare, onCompare }) {
  const ph = photos.hospitals[i % photos.hospitals.length];
  return (
    <div className="card !p-0 flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      <div className="relative">
        <Photo src={ph.src} alt={ph.alt} className="h-36 w-full" />
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy-900/70 to-transparent"
          aria-hidden="true"
        />
        <span className="pill absolute top-3 right-3 bg-white/95 text-green-800 shadow-sm">
          ✔ Listed
        </span>
        <span
          className="absolute left-4 bottom-3 grid place-items-center w-11 h-11 rounded-xl bg-white text-primary-700 font-display font-bold text-sm shadow-md"
          aria-hidden="true"
        >
          {initials(h.name)}
        </span>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display font-bold text-lg leading-snug text-slate-900">
          {h.name}
        </h3>
        <p className="text-sm text-slate-600 mt-0.5 flex items-center gap-1.5">
          <Icon n="pin" className="w-4 h-4 text-slate-400 shrink-0" />
          {h.type} · {h.city}, {h.state}
        </p>
        <p className="text-sm mt-3 line-clamp-2 text-slate-700">
          {h.description || "Profile details coming soon."}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {h.specialties.slice(0, 4).map((s) => (
            <span
              key={s}
              className="pill bg-primary-50 text-primary-700 ring-1 ring-primary-100"
            >
              {s}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3 mb-4">
          {h.doctorCount} doctor(s) bookable · Verified reviews: none yet
        </p>
        <div className="mt-auto pt-4 flex items-center gap-3 border-t border-slate-100">
          <Link className="btn" to={"/hospitals/" + h.slug}>
            View &amp; book
          </Link>
          {onCompare && (
            <label className="text-sm flex gap-1.5 items-center text-slate-700">
              <input type="checkbox" checked={compare} onChange={onCompare} />{" "}
              Compare
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
// Compact page banner (300px desktop / 220px mobile, fixed height = no layout shift): real photo with slow zoom or muted looping video, navy-to-teal overlay, breadcrumb, H1, subtitle, optional actions.
export function PageHero({ m, title, sub, crumb, actions }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 text-white h-[220px] md:h-[300px]">
      <Clip
        m={m}
        idle
        noSmall
        zoom
        pause
        className="absolute inset-0 -z-20"
        btn="top-3 right-3 sm:right-6"
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-navy-900/85 via-navy-900/60 to-teal-700/40"
          aria-hidden="true"
        />
      </Clip>
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-6 md:pb-9">
        <nav aria-label="Breadcrumb" className="text-xs text-sky-100/90 mb-2">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link className="hover:underline underline-offset-4" to="/">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-white">
              {crumb || title}
            </li>
          </ol>
        </nav>
        <h1 className="font-display font-extrabold tracking-tight text-3xl md:text-[40px] md:leading-tight motion-safe:animate-rise">
          {title}
        </h1>
        {sub && (
          <p className="mt-1.5 max-w-2xl text-slate-200 md:text-lg leading-snug">
            {sub}
          </p>
        )}
        {actions && (
          <div className="mt-3 md:mt-4 flex flex-wrap gap-3">{actions}</div>
        )}
      </div>
    </section>
  );
}
export function SlotPicker({ slug, doctorId, value, onChange }) {
  const today = ymd(new Date()),
    max = ymd(new Date(Date.now() + 60 * 864e5));
  const [date, setDate] = useState(value?.date || today);
  const slots = useMemo(() => {
    try {
      return svc.getSlots(slug, doctorId, date);
    } catch {
      return [];
    }
  }, [slug, doctorId, date, value]);
  return (
    <div className="space-y-3">
      <div>
        <label className="lbl" htmlFor="sp-date">
          Date
        </label>
        <input
          id="sp-date"
          type="date"
          className="input max-w-xs"
          min={today}
          max={max}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            onChange(null);
          }}
        />
      </div>
      {!slots.length ? (
        <p className="text-sm text-slate-600">
          The doctor does not consult on this day. Try another date.
        </p>
      ) : (
        <div
          className="grid grid-cols-3 sm:grid-cols-5 gap-2"
          role="group"
          aria-label="Available slots"
        >
          {slots.map((s) => (
            <button
              type="button"
              key={s.time}
              disabled={!s.free}
              onClick={() => onChange({ date, time: s.time })}
              className={
                "rounded-lg border py-2 text-sm " +
                (value?.date === date && value?.time === s.time
                  ? "bg-primary-600 text-white"
                  : "bg-white hover:bg-primary-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:line-through")
              }
            >
              {s.time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export function PatientAuth({ start = "login", onDone }) {
  const { login } = useAuth();
  const [tab, setTab] = useState(start);
  const [v, setV] = useState({ name: "", email: "", phone: "", password: "" });
  const [er, setEr] = useState("");
  const f = (k, l, t = "text") => (
    <div key={k}>
      <label className="lbl">{l}</label>
      <input
        className="input"
        type={t}
        value={v[k]}
        onChange={(e) => setV({ ...v, [k]: e.target.value })}
        autoComplete={k === "password" ? "current-password" : k}
      />
    </div>
  );
  const submit = (e) => {
    e.preventDefault();
    try {
      if (tab === "register") svc.registerPatient(v);
      onDone?.(login(v.email, v.password));
    } catch (x) {
      setEr(x.message);
    }
  };
  return (
    <form onSubmit={submit} className="card space-y-3 max-w-md" noValidate>
      <div className="flex gap-2">
        {[
          ["login", "Sign in"],
          ["register", "Create patient account"],
        ].map(([k, l]) => (
          <button
            type="button"
            key={k}
            onClick={() => {
              setTab(k);
              setEr("");
            }}
            className={
              "px-3 py-1.5 rounded-lg text-sm font-medium " +
              (tab === k ? "bg-primary-600 text-white" : "bg-slate-100")
            }
          >
            {l}
          </button>
        ))}
      </div>
      {tab === "register" && (
        <>
          {f("name", "Full name")}
          {f("phone", "Mobile (10 digits)", "tel")}
        </>
      )}
      {f("email", "Email", "email")}
      {f("password", "Password", "password")}
      {er && (
        <p className="err" role="alert">
          {er}
        </p>
      )}
      <button className="btn w-full">
        {tab === "login" ? "Sign in" : "Create account & continue"}
      </button>
    </form>
  );
}

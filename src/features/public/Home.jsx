import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as svc from "../../mocks/service.js";
import { getPlans } from "../../mocks/store.js";
import { FEATURE_LABELS } from "../../config/plans.js";
import { HospitalCard, Icon, initials, money } from "./shared.jsx";
import { titleCase } from "../../shared/utils/index.js";
import { Clip } from "../../shared/ui/index.jsx";
import { ROLES } from "../../config/roles.js";
import { hero, journey, workspace } from "../../config/media.js";
const X = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
const S = ({ title, sub, action, children, alt }) => (
  <section className={alt ? "bg-white border-y border-slate-200/70" : ""}>
    <div className={X + " py-10 md:py-12"}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 mb-6 md:mb-7">
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl md:text-[34px] md:leading-tight font-extrabold tracking-tight text-slate-900">
            {title}
          </h2>
          {sub && (
            <p className="text-slate-600 mt-2 md:text-lg leading-relaxed">
              {sub}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  </section>
);
const More = ({ to, children }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 hover:underline underline-offset-4"
  >
    {children}
    <Icon n="arrow" className="w-4 h-4" />
  </Link>
);
const STEPS = [
  [
    "Find a Hospital",
    "search",
    "Search published hospitals by location, specialty or service, then compare up to three side by side.",
    "/hospitals",
    "Find Hospitals",
    "p",
  ],
  [
    "Choose a Doctor",
    "users",
    "Browse doctors by name, city and specialty, with consultation fees shown up front.",
    "/doctors",
    "Find Doctors",
    "p",
  ],
  [
    "Book a Slot",
    "calendar",
    "Pick a date and a free slot, then sign in or create a patient account to confirm.",
    "/hospitals",
    "Book an Appointment",
    "p",
  ],
  [
    "Check-In & Registration",
    "clipboard",
    "Front desk staff register patients and manage the day's appointments.",
    "/request-demo",
    "Contact Sales",
    "h",
  ],
  [
    "Consultation",
    "steth",
    "Doctors record consultations and write prescriptions for their patients.",
    "/request-demo",
    "Contact Sales",
    "h",
  ],
  [
    "Diagnostics & Laboratory",
    "flask",
    "Doctors raise lab orders and laboratory staff process them in the Lab Orders module.",
    "/request-demo",
    "Contact Sales",
    "h",
  ],
  [
    "Treatment & Ward Care",
    "bed",
    "Nurses and doctors keep track of beds and wards in the Beds & Wards module.",
    "/request-demo",
    "Contact Sales",
    "h",
  ],
  [
    "Pharmacy & Billing",
    "tag",
    "Pharmacists work from prescriptions, while billing staff manage billing and claims.",
    "/request-demo",
    "Contact Sales",
    "h",
  ],
  [
    "Follow-Up & Records",
    "activity",
    "Patients track and cancel appointments up to 2 hours before from their dashboard; hospital records stay in the hospital's own workspace.",
    "/login",
    "Sign In to My Dashboard",
    "p",
  ],
];
// Sticky step-by-step showcase. Tabs pattern: click, arrow keys, Home/End; horizontally swipeable on mobile. The frame fades between clips (the one motion in this section).
function Journey() {
  const [i, setI] = useState(0);
  const refs = useRef([]);
  const role = STEPS[i][5],
    st = STEPS[i];
  const go = (n) => {
    setI(n);
    const el = refs.current[n];
    el?.focus?.();
    el?.scrollIntoView?.({
      block: "nearest",
      inline: "center",
      behavior: "smooth",
    });
  };
  const key = (e) => {
    const k = e.key,
      n =
        k === "ArrowDown" || k === "ArrowRight"
          ? Math.min(8, i + 1)
          : k === "ArrowUp" || k === "ArrowLeft"
            ? Math.max(0, i - 1)
            : k === "Home"
              ? 0
              : k === "End"
                ? 8
                : -1;
    if (n < 0) return;
    e.preventDefault();
    go(n);
  };
  const pickRole = (r) => {
    const n = STEPS.findIndex((x) => x[5] === r);
    setI(n);
    refs.current[n]?.scrollIntoView?.({ block: "nearest", inline: "center" });
  };
  return (
    <section className="bg-navy-900 text-white">
      <div className={X + " py-10 md:py-12"}>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 mb-6 md:mb-7">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl md:text-[34px] md:leading-tight font-extrabold tracking-tight">
              A Patient's Journey With MedCore
            </h2>
            <p className="mt-2 text-slate-300 md:text-lg leading-relaxed">
              Follow one visit from searching for a hospital to follow-up care,
              and see which MedCore features support each step.
            </p>
          </div>
          <div
            role="group"
            aria-label="Show steps for"
            className="inline-flex rounded-full bg-white/10 p-1 ring-1 ring-white/15"
          >
            {[
              ["p", "For Patients"],
              ["h", "For Hospitals"],
            ].map(([r, l]) => (
              <button
                key={r}
                type="button"
                aria-pressed={role === r}
                onClick={() => pickRole(r)}
                className={
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white " +
                  (role === r
                    ? "bg-white text-navy-900"
                    : "text-slate-200 hover:bg-white/10")
                }
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-10 items-start">
          <div
            role="tablist"
            aria-label="Patient Journey Steps"
            aria-orientation="vertical"
            onKeyDown={key}
            className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0"
          >
            {STEPS.map(([t, ic, , , , r], n) => (
              <button
                key={t}
                ref={(el) => (refs.current[n] = el)}
                type="button"
                role="tab"
                id={"jt-" + n}
                aria-selected={i === n}
                aria-controls="journey-panel"
                tabIndex={i === n ? 0 : -1}
                onClick={() => go(n)}
                className={
                  "snap-start shrink-0 lg:shrink flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white " +
                  (i === n
                    ? "bg-white text-navy-900 shadow-lg"
                    : r === role
                      ? "bg-white/10 text-white hover:bg-white/15"
                      : "text-slate-400 hover:bg-white/5")
                }
              >
                <span
                  className={
                    "grid place-items-center w-8 h-8 rounded-full text-sm font-display font-bold shrink-0 " +
                    (i === n ? "bg-primary-600 text-white" : "bg-white/10")
                  }
                >
                  {n + 1}
                </span>
                <span className="font-semibold whitespace-nowrap lg:whitespace-normal">
                  {t}
                </span>
                <Icon
                  n={ic}
                  className={
                    "hidden lg:block w-4 h-4 ml-auto shrink-0 " +
                    (i === n ? "text-teal-600" : "opacity-50")
                  }
                />
              </button>
            ))}
          </div>
          <div
            id="journey-panel"
            role="tabpanel"
            aria-labelledby={"jt-" + i}
            className="order-1 lg:order-2 lg:sticky lg:top-24"
          >
            <div key={i} className="motion-safe:animate-fade">
              <Clip
                m={journey[i]}
                decorative={false}
                noSmall
                pause
                className="aspect-video rounded-2xl ring-1 ring-white/15 shadow-2xl shadow-black/40"
              >
                <span className="absolute left-3 top-3 rounded-full bg-navy-950/60 px-3 py-1 text-xs font-semibold ring-1 ring-white/25 backdrop-blur">
                  Step {i + 1} of 9 |{" "}
                  {role === "p" ? "For Patients" : "For Hospitals"}
                </span>
              </Clip>
              <div className="mt-4">
                <h3 className="font-display text-xl font-bold">{st[0]}</h3>
                <p className="mt-1 text-slate-300 leading-relaxed">{st[2]}</p>
                <Link
                  to={st[3]}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-white hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
                >
                  {st[4]}
                  <Icon n="arrow" className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
// Three short role clips: plays on hover/focus (desktop) or tap (mobile).
const WS = [
  [
    "Front Desk",
    "receptionist",
    "Register patients, manage appointments and check bed availability.",
  ],
  [
    "Clinical Teams",
    "doctor",
    "Doctors, nurses, pharmacists and lab staff work from consultations, prescriptions and lab orders.",
  ],
  [
    "Administration",
    "hospital_admin",
    "Set up departments, doctors and users, and review reports and the audit log.",
  ],
];
const rise = (ms) => ({ animationDelay: ms + "ms" });
export default function Home() {
  const go = useNavigate();
  const [city, setCity] = useState("");
  const [sp, setSp] = useState("");
  const hs = svc.listHospitals(),
    specs = [...new Set(hs.flatMap((h) => h.specialties))].sort(),
    services = [...new Set(hs.flatMap((h) => h.services))],
    docs = svc.listDoctors().slice(0, 4),
    plans = Object.entries(getPlans()),
    nDocs = hs.reduce((n, h) => n + h.doctorCount, 0);
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-navy-900 text-white">
        <Clip
          m={hero}
          eager
          pause
          className="absolute inset-0 -z-20"
          btn="top-4 right-4 sm:right-6"
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-primary-800/70 to-teal-700/45"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950/60 to-transparent"
            aria-hidden="true"
          />
        </Clip>

        <div className={X + " pt-12 pb-8 md:pt-16 md:pb-10"}>
          <h1 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-[60px] lg:leading-[1.06] max-w-4xl motion-safe:animate-rise">
            Find The Right Hospital.{" "}
            <span className="block text-sky-200">
              Book Your Appointment Online.
            </span>
          </h1>
          <p
            className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-200 motion-safe:animate-rise"
            style={rise(80)}
          >
            MedCore connects patients with hospitals and gives hospitals one
            secure platform to run appointments, staff and daily operations.
          </p>
          <form
            className="mt-8 bg-white text-slate-900 rounded-2xl p-3 sm:p-4 shadow-2xl shadow-slate-950/30 ring-1 ring-white/40 grid md:grid-cols-12 gap-3 max-w-5xl motion-safe:animate-rise"
            style={rise(160)}
            onSubmit={(e) => {
              e.preventDefault();
              go(
                `/hospitals?city=${encodeURIComponent(city)}&specialty=${encodeURIComponent(sp)}`,
              );
            }}
          >
            <div className="md:col-span-4">
              <label className="lbl" htmlFor="h-city">
                Location
              </label>
              <input
                id="h-city"
                className="input !py-2.5"
                placeholder="City or state"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="md:col-span-4">
              <label className="lbl" htmlFor="h-sp">
                Specialty / Service
              </label>
              <select
                id="h-sp"
                className="input !py-2.5 bg-white"
                value={sp}
                onChange={(e) => setSp(e.target.value)}
              >
                <option value="">Any Specialty</option>
                {specs.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4 flex items-end gap-2">
              <button className="btn flex-1 !py-2.5">Search Hospitals</button>
              <Link className="btn-o !py-2.5" to="/doctors">
                Find Doctors
              </Link>
            </div>
          </form>
          <div
            className="mt-6 flex flex-wrap gap-3 motion-safe:animate-rise"
            style={rise(240)}
          >
            <Link
              className="btn !bg-white !text-primary-700 hover:!bg-sky-50 !px-5 !py-3 !text-[15px]"
              to="/hospitals"
            >
              Book an Appointment
            </Link>
            <Link
              className="btn !bg-transparent border border-white/70 hover:!bg-white/10 !px-5 !py-3 !text-[15px]"
              to="/register-hospital"
            >
              I Represent a Hospital
            </Link>
          </div>
          <ul
            className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200 motion-safe:animate-rise"
            style={rise(320)}
          >
            {[
              "Secure, Role-Based Access",
              "Isolated Hospital Workspaces",
              "Online Appointment Booking",
            ].map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <Icon n="check" className="w-4 h-4 text-teal-300" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className={X + " relative pb-8 md:pb-10"}>
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-xl shadow-slate-900/10">
            {[
              ["building", hs.length, "Published Hospitals"],
              ["users", nDocs, "Bookable Doctors"],
              ["activity", specs.length, "Specialties"],
              ["clipboard", services.length, "Services Listed"],
            ].map(([ic, n, l]) => (
              <div
                key={l}
                className="bg-white p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
              >
                <span className="hidden sm:grid place-items-center w-11 h-11 rounded-xl bg-primary-50 text-primary-700 shrink-0">
                  <Icon n={ic} />
                </span>
                <div className="flex flex-col-reverse">
                  <dt className="text-sm text-slate-600 mt-1">{l}</dt>
                  <dd className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
                    {n}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <Journey />
      <S
        title="Featured Hospitals"
        sub="Only hospitals that have completed setup and chosen to publish their profile appear here."
        action={
          hs.length > 0 && <More to="/hospitals">View All Hospitals</More>
        }
      >
        {hs.length ? (
          <div
            className="fit-grid"
            style={{ "--min": "19rem", "--max": "27rem" }}
          >
            {hs.slice(0, 6).map((h, i) => (
              <HospitalCard key={h.slug} i={i} h={h} />
            ))}
          </div>
        ) : (
          <p className="card">
            No hospitals are published yet. Hospitals appear here after
            onboarding.
          </p>
        )}
        {hs.length > 0 && (
          <p className="text-sm text-slate-600 mt-4">
            {hs.length} published hospital(s) | {nDocs} bookable doctor(s) on
            this platform (live count).
          </p>
        )}
      </S>
      <S alt title="Hospitals by Specialty">
        {specs.length ? (
          <div className="flex flex-wrap gap-2.5">
            {specs.map((s) => (
              <Link
                key={s}
                className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-primary-600 hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                to={"/hospitals?specialty=" + encodeURIComponent(s)}
              >
                {s}
              </Link>
            ))}
          </div>
        ) : (
          <p>Specialties appear as hospitals publish them.</p>
        )}
      </S>
      <S
        title="Doctors You Can Book"
        action={docs.length > 0 && <More to="/doctors">See All Doctors</More>}
      >
        {docs.length ? (
          <div
            className="fit-grid"
            style={{ "--min": "15rem", "--max": "21rem" }}
          >
            {docs.map((d) => (
              <div
                key={d.slug + d.id}
                className="card flex flex-col transition-shadow hover:shadow-lift"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="grid place-items-center w-12 h-12 rounded-full bg-primary-50 text-primary-700 font-display font-bold ring-1 ring-primary-100 shrink-0"
                    aria-hidden="true"
                  >
                    {initials(d.name)}
                  </span>
                  <div>
                    <h3 className="font-semibold leading-snug">{d.name}</h3>
                    <p className="text-sm text-slate-600">
                      {d.dept} | {d.qual}
                    </p>
                  </div>
                </div>
                <p className="text-sm mt-4 flex items-start gap-1.5 text-slate-700">
                  <Icon
                    n="pin"
                    className="w-4 h-4 mt-0.5 text-slate-400 shrink-0"
                  />
                  {d.hospital}, {d.city}
                </p>
                <p className="text-sm font-medium mt-1.5">
                  Consultation {money(d.fee)}
                </p>
                <div className="mt-auto pt-4">
                  <Link className="btn-o" to={`/book/${d.slug}/${d.id}`}>
                    Check Slots
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Doctors appear as hospitals publish them.</p>
        )}
      </S>
      <S
        alt
        title="Healthcare Services"
        sub="Services are listed by each participating hospital - these are the ones currently published:"
      >
        {services.length ? (
          <div className="flex flex-wrap gap-2.5">
            {services.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-medium text-slate-700"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-teal-600"
                  aria-hidden="true"
                />
                {titleCase(s)}
              </span>
            ))}
          </div>
        ) : (
          <p>No services published yet.</p>
        )}
      </S>
      <S title="How It Works">
        <ol className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            [
              "Patients Discover & Book",
              "Search hospitals, compare, choose a doctor and an available slot, then confirm.",
            ],
            [
              "Hospitals Run Operations",
              "Hospitals manage staff, roles, patients, appointments and workflows in their own isolated workspace.",
            ],
            [
              "The Platform Keeps It Together",
              "Subscriptions, features and security are managed centrally by the platform owner.",
            ],
          ].map(([t, d], i) => (
            <li key={t} className="card relative !p-6">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-primary-600 text-white font-display font-bold">
                {i + 1}
              </span>
              <h3 className="mt-4 font-display font-bold text-lg">{t}</h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                {d}
              </p>
              {i < 2 && (
                <span
                  className="hidden md:block absolute top-11 -right-8 w-8 border-t-2 border-dashed border-primary-200"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </S>
      <S alt title="Why MedCore">
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-7 rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-teal-50 p-6 md:p-8">
          {[
            ["search", "Easier Hospital Discovery"],
            ["calendar", "Convenient Online Appointment Booking"],
            ["clipboard", "Less Manual Administrative Work"],
            ["network", "Better Coordination Between Departments"],
            ["shield", "Secure Access to Authorised Information Only"],
            ["tag", "Transparent Service and Fee Information"],
          ].map(([ic, b]) => (
            <li key={b} className="flex items-center gap-4">
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-white text-primary-700 shadow-sm ring-1 ring-primary-100 shrink-0">
                <Icon n={ic} />
              </span>
              <span className="font-semibold text-slate-900 leading-snug">
                {b}
              </span>
            </li>
          ))}
        </ul>
      </S>
      <S
        title="Inside the Hospital Workspace"
        sub="Short clips of the teams MedCore supports. Hover or tap a clip to play it."
      >
        <div
          className="fit-grid"
          style={{ "--min": "17rem", "--max": "26rem" }}
        >
          {WS.map(([t, r, d], n) => (
            <figure
              key={t}
              className="card !p-0 overflow-hidden flex flex-col transition-shadow hover:shadow-lift"
            >
              <Clip
                m={workspace[n]}
                mode="hover"
                decorative={false}
                className="aspect-video"
              />
              <figcaption className="p-5">
                <span className="pill bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                  {ROLES[r].label}
                </span>
                <h3 className="mt-2 font-display font-bold text-lg">{t}</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  {d}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </S>
      <S
        title="For Hospitals: Subscription Plans"
        sub="Choose a plan that fits your organisation. Contact us for pricing."
      >
        <div
          className="fit-grid"
          style={{ "--min": "16rem", "--max": "24rem" }}
        >
          {plans.map(([k, p]) => (
            <div
              key={k}
              className="card relative flex flex-col overflow-hidden !p-6 transition-shadow hover:shadow-lift"
            >
              <div
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-600 to-teal-600"
                aria-hidden="true"
              />
              <h3 className="font-display font-bold text-xl">{p.name}</h3>
              <ul className="text-sm mt-4 space-y-2.5 flex-1">
                {p.custom ? (
                  <li className="text-slate-700">
                    Features selected and approved for your organisation.
                  </li>
                ) : (
                  p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-slate-700"
                    >
                      <Icon
                        n="check"
                        className="w-4 h-4 mt-0.5 text-teal-600 shrink-0"
                      />
                      {titleCase(FEATURE_LABELS[f] || f)}
                    </li>
                  ))
                )}
              </ul>
              <Link className="btn mt-6" to={"/register-hospital?plan=" + k}>
                Choose {p.name}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-navy-900 via-primary-800 to-teal-700 text-white p-7 md:p-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h3 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
              Ready to Bring Your Hospital Onto MedCore?
            </h3>
            <p className="mt-2 text-sky-100">
              Register your hospital or contact our team.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="btn !bg-white !text-primary-700 hover:!bg-sky-50 !px-5 !py-3"
              to="/register-hospital"
            >
              Register Your Hospital
            </Link>
            <Link
              className="btn !bg-transparent border border-white/70 hover:!bg-white/10 !px-5 !py-3"
              to="/request-demo"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </S>
    </div>
  );
}

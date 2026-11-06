import { useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import * as svc from "../../mocks/service.js";
import {
  HospitalCard,
  Wrap,
  money,
  SlotPicker,
  PatientAuth,
  PageHero,
  Icon,
  initials,
  deptIcon,
} from "./shared.jsx";
import { pages } from "../../config/media.js";
import { useAuth } from "../../core/auth/AuthContext.jsx";
import { basePath } from "../../core/rbac.js";
import { Msg } from "../modules/ModulePage.jsx";
export function Hospitals() {
  const [sp, setSp] = useSearchParams();
  const go = useNavigate();
  const [cmp, setCmp] = useState([]);
  const q = {
    q: sp.get("q") || "",
    city: sp.get("city") || "",
    specialty: sp.get("specialty") || "",
    service: sp.get("service") || "",
  };
  const all = svc.listHospitals(),
    list = svc.listHospitals(q),
    specs = [...new Set(all.flatMap((h) => h.specialties))].sort(),
    sv = [...new Set(all.flatMap((h) => h.services))];
  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    v ? n.set(k, v) : n.delete(k);
    setSp(n);
  };
  return (
    <>
      <PageHero
        m={pages.hospitals}
        title="Find Hospitals"
        sub="Search published hospitals by name, location, specialty or service, then compare and book."
      />
      <div className="lg:sticky lg:top-[65px] z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            className="input"
            aria-label="Hospital name"
            placeholder="Hospital name"
            value={q.q}
            onChange={(e) => set("q", e.target.value)}
          />
          <input
            className="input"
            aria-label="Location"
            placeholder="City or state"
            value={q.city}
            onChange={(e) => set("city", e.target.value)}
          />
          <select
            className="input"
            aria-label="Specialty"
            value={q.specialty}
            onChange={(e) => set("specialty", e.target.value)}
          >
            <option value="">Any specialty</option>
            {specs.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="input"
            aria-label="Service"
            value={q.service}
            onChange={(e) => set("service", e.target.value)}
          >
            <option value="">Any service</option>
            {sv.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <Wrap>
        {cmp.length > 1 && (
          <div className="mb-3">
            <button
              className="btn"
              onClick={() => go("/compare?ids=" + cmp.join(","))}
            >
              Compare {cmp.length} hospitals
            </button>
          </div>
        )}
        {!list.length ? (
          <div className="card text-center py-10 max-w-xl mx-auto">
            <span className="mx-auto grid place-items-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-700">
              <Icon n="search" className="w-7 h-7" />
            </span>
            <h2 className="mt-4 font-display font-bold text-lg">
              No Hospitals Found
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              No hospitals match your filters.
            </p>
            <button
              className="btn-o mt-4"
              onClick={() => setSp(new URLSearchParams())}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            className="fit-grid"
            style={{ "--min": "19rem", "--max": "27rem" }}
          >
            {list.map((h, i) => (
              <HospitalCard
                key={h.slug}
                i={i}
                h={h}
                compare={cmp.includes(h.slug)}
                onCompare={() =>
                  setCmp((c) =>
                    c.includes(h.slug)
                      ? c.filter((x) => x !== h.slug)
                      : c.length < 3
                        ? [...c, h.slug]
                        : c,
                  )
                }
              />
            ))}
          </div>
        )}
      </Wrap>
    </>
  );
}
export function HospitalProfile() {
  const { slug } = useParams();
  let h;
  try {
    h = svc.getHospital(slug);
  } catch {
    return (
      <Msg t="404 – Hospital not found or not published" home="/hospitals" />
    );
  }
  return (
    <Wrap>
      <h1 className="text-3xl font-bold">{h.name}</h1>
      <p className="text-slate-600">
        {h.type} · {h.city}, {h.state} · Code {h.code}
      </p>
      <div className="grid lg:grid-cols-3 gap-4 mt-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h2 className="font-semibold mb-2">About</h2>
            <p className="text-sm">
              {h.description || "No description published."}
            </p>
            <h3 className="font-medium mt-4 text-sm">Departments</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {h.specialties.map((s) => (
                <span key={s} className="pill bg-primary-50 text-primary-700">
                  {s}
                </span>
              ))}
            </div>
            <h3 className="font-medium mt-4 text-sm">
              Services &amp; facilities
            </h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {h.services.length ? (
                h.services.map((s) => (
                  <span key={s} className="pill bg-slate-100 text-slate-700">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">Not published</span>
              )}
            </div>
          </div>
          <div className="card">
            <h2 className="font-semibold mb-3">Doctors</h2>
            {!h.doctors.length ? (
              <p className="text-sm">No doctors are bookable yet.</p>
            ) : (
              <div className="divide-y">
                {h.doctors.map((d) => (
                  <div
                    key={d.id}
                    className="py-3 flex flex-wrap justify-between gap-3 items-center"
                  >
                    <div>
                      <p className="font-medium">{d.name}</p>
                      <p className="text-sm text-slate-600">
                        {d.dept} · {d.qual}
                      </p>
                      <p className="text-xs text-slate-500">
                        {d.days}, {d.hours} · Next free:{" "}
                        {d.next
                          ? `${d.next.date} ${d.next.time}`
                          : "none in 14 days"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{money(d.fee)}</p>
                      <Link className="btn mt-1" to={`/book/${slug}/${d.id}`}>
                        Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="card text-sm space-y-1">
            <h2 className="font-semibold">Visit &amp; contact</h2>
            <p>🕒 {h.hours || "Hours not published"}</p>
            <p>📞 {h.phone}</p>
            <p>✉️ {h.email}</p>
            <a
              className="btn-o mt-2"
              target="_blank"
              rel="noopener noreferrer"
              href={
                "https://www.google.com/maps/search/?api=1&query=" +
                encodeURIComponent(h.name + " " + h.city)
              }
            >
              Get directions
            </a>
          </div>
          <div className="card text-sm">
            <h2 className="font-semibold mb-1">Booking policy</h2>
            <p>
              {h.autoConfirm
                ? "Appointments are confirmed instantly."
                : "Appointments need hospital approval."}{" "}
              You can cancel up to 2 hours before your appointment.
            </p>
            <h2 className="font-semibold mt-3 mb-1">Reviews</h2>
            <p className="text-slate-600">No verified reviews yet.</p>
          </div>
        </div>
      </div>
    </Wrap>
  );
}
export function Doctors() {
  const [q, setQ] = useState(""),
    [sp, setSp] = useState(""),
    [city, setCity] = useState("");
  const all = svc.listDoctors(),
    list = svc.listDoctors({ q, specialty: sp, city }),
    specs = [...new Set(all.map((d) => d.dept))].sort();
  return (
    <>
      <PageHero
        m={pages.doctors}
        title="Find Doctors"
        sub="Browse doctors by name, city and specialty, then check free slots."
      />
      <Wrap>
        <div className="card grid sm:grid-cols-3 gap-3 mb-5 !p-4">
          <input
            className="input"
            aria-label="Doctor name"
            placeholder="Doctor name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <input
            className="input"
            aria-label="City"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <select
            className="input"
            aria-label="Specialty"
            value={sp}
            onChange={(e) => setSp(e.target.value)}
          >
            <option value="">Any specialty</option>
            {specs.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        {!list.length ? (
          <p className="card">No doctors match.</p>
        ) : (
          <div
            className="fit-grid"
            style={{ "--min": "15rem", "--max": "21rem" }}
          >
            {list.map((d) => (
              <div
                key={d.slug + d.id}
                className="card flex flex-col transition-shadow hover:shadow-lift"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="relative grid place-items-center w-12 h-12 rounded-full bg-primary-50 text-primary-700 font-display font-bold ring-1 ring-primary-100 shrink-0"
                    aria-hidden="true"
                  >
                    {initials(d.name)}
                    <span className="absolute -bottom-1 -right-1 grid place-items-center w-6 h-6 rounded-full bg-teal-600 text-white ring-2 ring-white">
                      <Icon n={deptIcon(d.dept)} className="w-3.5 h-3.5" />
                    </span>
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold leading-snug">
                      {d.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {d.dept} · {d.qual}
                    </p>
                  </div>
                </div>
                <p className="text-sm mt-3 flex items-start gap-1.5">
                  <Icon
                    n="pin"
                    className="w-4 h-4 mt-0.5 text-slate-400 shrink-0"
                  />
                  <span>
                    <Link
                      className="text-primary-700 font-medium hover:underline underline-offset-2"
                      to={"/hospitals/" + d.slug}
                    >
                      {d.hospital}
                    </Link>
                    , {d.city}
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {d.days}, {d.hours}
                </p>
                <p className="font-semibold mt-2">{money(d.fee)}</p>
                <div className="mt-auto pt-4">
                  <Link className="btn" to={`/book/${d.slug}/${d.id}`}>
                    Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Wrap>
    </>
  );
}
export function Compare() {
  const [sp] = useSearchParams();
  const hs = (sp.get("ids") || "")
    .split(",")
    .map((s) => {
      try {
        return svc.getHospital(s);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  if (hs.length < 2)
    return (
      <Msg t="Select at least two hospitals to compare" home="/hospitals" />
    );
  const fee = (h) =>
    h.doctors.length
      ? `${money(Math.min(...h.doctors.map((d) => d.fee)))} – ${money(Math.max(...h.doctors.map((d) => d.fee)))}`
      : "—";
  const rows = [
    ["Location", (h) => `${h.city}, ${h.state}`],
    ["Type", (h) => h.type],
    ["Departments", (h) => h.specialties.join(", ")],
    ["Services", (h) => h.services.join(", ") || "—"],
    ["Operating hours", (h) => h.hours || "—"],
    ["Bookable doctors", (h) => h.doctors.length],
    ["Consultation fee range", fee],
    [
      "Booking",
      (h) => (h.autoConfirm ? "Instant confirmation" : "Needs approval"),
    ],
    ["Verified reviews", () => "None yet"],
  ];
  return (
    <Wrap>
      <h1 className="text-2xl font-bold mb-4">Compare hospitals</h1>
      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-2"></th>
              {hs.map((h) => (
                <th key={h.slug} className="text-left py-2 pr-4">
                  <Link
                    className="text-primary-600 underline"
                    to={"/hospitals/" + h.slug}
                  >
                    {h.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([l, f]) => (
              <tr key={l} className="border-t">
                <td className="py-2 pr-4 font-medium text-slate-600">{l}</td>
                {hs.map((h) => (
                  <td key={h.slug} className="py-2 pr-4">
                    {f(h)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Wrap>
  );
}
export function Book() {
  const { slug, doctorId } = useParams();
  const { user } = useAuth();
  const [pick, setPick] = useState(null);
  const [done, setDone] = useState(null);
  const [er, setEr] = useState("");
  let h;
  try {
    h = svc.getHospital(slug);
  } catch {
    return (
      <Msg t="This hospital is not accepting bookings" home="/hospitals" />
    );
  }
  const d = h.doctors.find((x) => x.id === doctorId);
  if (!d) return <Msg t="Doctor not available" home={"/hospitals/" + slug} />;
  const confirm = () => {
    try {
      setDone(
        svc.bookAppointment(user, {
          slug,
          doctorId,
          date: pick.date,
          time: pick.time,
        }),
      );
    } catch (e) {
      setEr(e.message);
      setPick(null);
    }
  };
  if (done)
    return (
      <Wrap narrow>
        <div className="card text-center">
          <div className="text-4xl">
            {done.status === "Confirmed" ? "✅" : "⏳"}
          </div>
          <h1 className="text-xl font-bold mt-2">
            Appointment {done.status.toLowerCase()}
          </h1>
          <p className="mt-2">
            Reference <b>{done.ref}</b>
          </p>
          <p className="text-sm text-slate-600">
            {done.doctor} · {done.hospital}
            <br />
            {done.date} at {done.time} · Fee {money(done.fee)} (pay at hospital)
          </p>
          <Link className="btn mt-4" to="/me/myAppointments">
            View my appointments
          </Link>
        </div>
      </Wrap>
    );
  return (
    <Wrap narrow>
      <h1 className="text-2xl font-bold">Book with {d.name}</h1>
      <p className="text-slate-600 text-sm mb-4">
        {d.dept} ·{" "}
        <Link className="underline" to={"/hospitals/" + slug}>
          {h.name}
        </Link>{" "}
        · Consultation {money(d.fee)}
      </p>
      <div className="card mb-4">
        <h2 className="font-semibold mb-3">1. Choose date &amp; time</h2>
        <SlotPicker
          slug={slug}
          doctorId={doctorId}
          value={pick}
          onChange={(p) => {
            setPick(p);
            setEr("");
          }}
        />
      </div>
      <div className="card">
        <h2 className="font-semibold mb-3">2. Confirm</h2>
        {er && (
          <p className="err mb-2" role="alert">
            {er}
          </p>
        )}
        {!pick ? (
          <p className="text-sm text-slate-600">Select a time slot first.</p>
        ) : user?.role === "patient" ? (
          <>
            <p className="text-sm mb-3">
              {pick.date} at {pick.time} as <b>{user.name}</b>.{" "}
              {h.autoConfirm
                ? "Confirmed instantly."
                : "Hospital will approve your request."}
            </p>
            <button className="btn" onClick={confirm}>
              Confirm appointment
            </button>
          </>
        ) : user ? (
          <p className="text-sm">
            You are signed in as staff. Sign out and use a patient account to
            book.
          </p>
        ) : (
          <>
            <p className="text-sm mb-3">
              Sign in or create a patient account to confirm{" "}
              <b>
                {pick.date} {pick.time}
              </b>
              .
            </p>
            <PatientAuth onDone={() => {}} />
          </>
        )}
      </div>
    </Wrap>
  );
}

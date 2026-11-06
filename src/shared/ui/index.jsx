import { useState, useRef, useEffect } from "react";
import { pillClass } from "../utils/index.js";
import * as MEDIA from "../../config/media.js";
export const Card = ({ title, action, children, className = "" }) => (
  <section className={"card " + className}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
    )}
    {children}
  </section>
);
export const Pill = ({ children }) => (
  <span className={"pill " + pillClass(String(children))}>{children}</span>
);
export const Kpi = ({ label, value, delta, accent }) => (
  <div className="card" style={{ borderTop: `3px solid ${accent}` }}>
    <div className="text-sm text-slate-600">{label}</div>
    <div className="text-2xl font-bold mt-1">{value}</div>
    {delta && (
      <div
        className={
          "text-xs mt-1 " +
          (delta.startsWith("-") ? "text-red-700" : "text-green-700")
        }
      >
        {delta.startsWith("-") ? "▼" : "▲"} {delta.replace(/^[+-]/, "")} vs last
        week
      </div>
    )}
  </div>
);
export const Skeleton = ({ n = 4 }) => (
  <div className="space-y-2" aria-busy="true">
    {Array.from({ length: n }, (_, i) => (
      <div key={i} className="h-9 rounded bg-slate-200 animate-pulse" />
    ))}
  </div>
);
export const EmptyState = ({ text, title, media, action }) =>
  media ? (
    <div className="text-center py-6">
      <Photo
        src={media.src}
        alt={media.alt}
        className="mx-auto h-36 w-full max-w-sm rounded-2xl"
      />
      {title && (
        <h3 className="mt-4 font-display font-bold text-lg">{title}</h3>
      )}
      <p className="text-sm text-slate-600 mt-1">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  ) : (
    <p className="text-sm text-slate-600 py-6 text-center">{text}</p>
  );
export const ErrorState = ({ error, onRetry }) => (
  <div role="alert" className="text-center py-6">
    <p className="text-red-700 font-medium">{error.message}</p>
    <p className="text-xs text-slate-500">Code: {error.code}</p>
    <button className="btn-o mt-3" onClick={onRetry}>
      Try again
    </button>
  </div>
);
export function DataTable({ cols, rows, q = "" }) {
  const f = rows.filter((r) =>
    r.join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  if (!f.length) return <EmptyState text="No records match your search." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-slate-500">
          <tr>
            {cols.map((c) => (
              <th key={c} className="py-2 pr-4">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {f.map((r, i) => (
            <tr key={i} className="border-t">
              {r.map((c, j) => (
                <td key={j} className="py-2.5 pr-4">
                  {cols[j] === "Status" ? <Pill>{c}</Pill> : c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
// Brand logo — single source for every place the app shows its logo (public navbar/footer, sign-in, dashboard sidebars).
// `mark` renders the icon only (slim rails); `tone="light"` is for dark backgrounds.
export const Logo = ({
  tone = "dark",
  mark = false,
  size = 36,
  sub = "",
  className = "",
}) => {
  const light = tone === "light";
  return (
    <span
      className={"inline-flex items-center gap-2.5 " + className}
      {...(mark ? { role: "img", "aria-label": "MedCore" } : {})}
    >
      <img
        src="./medcore-logo.png"
        alt=""
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {!mark && (
        <span className="leading-none">
          <span
            className={
              "block font-display font-extrabold tracking-tight text-[19px] " +
              (light ? "text-white" : "text-slate-900")
            }
          >
            MedCore
          </span>
          {sub && (
            <span
              className={
                "block mt-1 text-[10.5px] font-medium " +
                (light ? "text-slate-400" : "text-slate-500")
              }
            >
              {sub}
            </span>
          )}
        </span>
      )}
    </span>
  );
};

// ---- Media (real footage / photos). One Clip + one Photo power every video in the app; failures fall back to poster, then to a navy-to-teal gradient. Never an empty box.
const calm = () => {
  try {
    const q = (x) => !!window.matchMedia?.(x)?.matches;
    return {
      reduce: q("(prefers-reduced-motion: reduce)"),
      small: q("(max-width: 639px)"),
      hover: q("(hover: hover)"),
      save:
        !!navigator.connection?.saveData || /jsdom/i.test(navigator.userAgent),
    };
  } catch {
    return {};
  }
};
const MI = {
  play: <path d="M7 4.5v15l12-7.5z" />,
  pause: (
    <>
      <rect x="6" y="4.5" width="4" height="15" rx="1" />
      <rect x="14" y="4.5" width="4" height="15" rx="1" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m10 9 5 3-5 3z" />
    </>
  ),
};
const MIcon = ({ n, className = "w-3 h-3", solid = true }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill={solid ? "currentColor" : "none"}
    stroke={solid ? "none" : "currentColor"}
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {MI[n]}
  </svg>
);
const GRAD = "bg-gradient-to-br from-navy-900 via-primary-800 to-teal-700 ";
export function Photo({ src, alt = "", className = "", zoom }) {
  const [bad, setBad] = useState(false);
  return (
    <div className={"relative overflow-hidden " + GRAD + className}>
      {src && !bad && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setBad(true)}
          className={
            "absolute inset-0 w-full h-full object-cover " +
            (zoom ? "motion-safe:animate-slowzoom" : "")
          }
        />
      )}
    </div>
  );
}
// mode "loop": muted autoplay loop with Pause/Play (pause=true). mode "hover": plays on hover/focus (desktop) or tap (touch).
// Video loads only when near the viewport (and after idle if idle=true), pauses when scrolled out, and is skipped on Save-Data; noSmall = poster only on phones.
export function Clip({
  m,
  mode = "loop",
  eager,
  idle,
  noSmall,
  zoom,
  decorative = true,
  pause,
  className = "",
  btn = "bottom-3 right-3",
  children,
}) {
  const box = useRef(null),
    vid = useRef(null),
    c = useRef(calm()).current;
  const [near, setNear] = useState(
      () => !!eager || typeof IntersectionObserver === "undefined",
    ),
    [vis, setVis] = useState(true),
    [late, setLate] = useState(!idle),
    [ready, setReady] = useState(false),
    [bad, setBad] = useState(false),
    [pi, setPi] = useState(0),
    [user, setUser] = useState(() => mode === "loop" && !c.reduce),
    [hot, setHot] = useState(false),
    [go, setGo] = useState(false);
  const pl = [m?.poster, m?.altPoster].filter(Boolean),
    srcs = [
      m?.webm && [m.webm, "video/webm"],
      m?.mp4 && [m.mp4, "video/mp4"],
      ...(m?.alt || []).map((u) => [u, "video/mp4"]),
    ].filter(Boolean),
    want = !!m?.mp4 && !c.save && !(noSmall && c.small) && !bad,
    on = mode === "hover" ? hot : user,
    load = want && late && near && go;
  useEffect(() => {
    if (!idle) return;
    const f = () => setLate(true),
      ric = window.requestIdleCallback,
      t = ric ? ric(f, { timeout: 2000 }) : setTimeout(f, 800);
    return () => (ric ? window.cancelIdleCallback?.(t) : clearTimeout(t));
  }, [idle]);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVis(e.isIntersecting);
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (on) setGo(true);
  }, [on]);
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    v.muted = true;
    if (on && vis) {
      const p = v.play?.();
      p?.catch?.(() => {});
    } else v.pause?.();
  }, [on, vis, load]);
  const hv = mode === "hover";
  return (
    <div
      ref={box}
      className={
        (/\babsolute\b/.test(className) ? "" : "relative ") +
        "overflow-hidden " +
        GRAD +
        className
      }
    >
      <div
        className="absolute inset-0"
        {...(decorative
          ? { "aria-hidden": "true" }
          : { role: "img", "aria-label": m?.label })}
      >
        {pi >= pl.length && !ready && (
          <div className="absolute inset-0 grid place-items-center p-4 text-center text-xs text-white/70">
            <span>
              <MIcon
                n="film"
                solid={false}
                className="w-8 h-8 mx-auto mb-1 opacity-60"
              />
              {!decorative && m?.label}
            </span>
          </div>
        )}
        {pi < pl.length && (
          <img
            key={pl[pi]}
            src={pl[pi]}
            alt=""
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onError={() => setPi((n) => n + 1)}
            className={
              "absolute inset-0 w-full h-full object-cover " +
              (zoom ? "motion-safe:animate-slowzoom" : "")
            }
          />
        )}
        {load && (
          <video
            ref={vid}
            className={
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 " +
              (ready ? "opacity-100" : "opacity-0")
            }
            muted
            loop
            playsInline
            preload={eager ? "auto" : "none"}
            tabIndex={-1}
            onLoadedData={() => setReady(true)}
          >
            {srcs.map(([u, t], k) => (
              <source
                key={u}
                src={u}
                type={t}
                onError={k === srcs.length - 1 ? () => setBad(true) : undefined}
              />
            ))}
          </video>
        )}
      </div>
      {children}
      {hv && want && (
        <button
          type="button"
          aria-pressed={hot}
          aria-label={(hot ? "Pause" : "Play") + " Clip: " + m.label}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHot(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setHot(false)}
          onFocus={() => setHot(true)}
          onBlur={() => setHot(false)}
          onClick={() => !c.hover && setHot((h) => !h)}
          className="absolute inset-0 w-full h-full grid place-items-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white/80"
        >
          {!hot && (
            <span className="grid place-items-center w-12 h-12 rounded-full bg-white/90 text-navy-900 shadow-lg">
              <MIcon n="play" className="w-5 h-5 ml-0.5" />
            </span>
          )}
        </button>
      )}
      {pause && !hv && want && (
        <button
          type="button"
          onClick={() => setUser((u) => !u)}
          aria-pressed={!user}
          aria-label={user ? "Pause background video" : "Play background video"}
          className={
            "absolute z-10 inline-flex items-center gap-2 rounded-full bg-navy-950/60 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur hover:bg-navy-950/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white " +
            btn
          }
        >
          <MIcon n={user ? "pause" : "play"} />
          {user ? "Pause" : "Play"}
        </button>
      )}
    </div>
  );
}
// Slim, collapsible, role-aware welcome banner for dashboards. Purely visual: wraps the existing greeting; remembers collapse state in sessionStorage.
export function WelcomeBanner({ role, accent = "#0369a1", children }) {
  const K = "mc.welcome";
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem(K) !== "0";
    } catch {
      return true;
    }
  });
  const set = (v) => {
    setOpen(v);
    try {
      sessionStorage.setItem(K, v ? "1" : "0");
    } catch {}
  };
  const m = MEDIA.roles[role] || MEDIA.roles.hospital_admin;
  return (
    <section
      aria-label="Welcome"
      className="relative isolate overflow-hidden rounded-2xl bg-navy-900 text-white shadow-card border-l-4"
      style={{ borderColor: accent }}
    >
      {open && <Clip m={m} idle noSmall className="absolute inset-0 -z-20" />}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-teal-700/40"
        aria-hidden="true"
      />
      <div
        className={
          "relative flex items-center justify-between gap-4 px-5 " +
          (open ? "py-5 md:py-7" : "py-3")
        }
      >
        <div className="min-w-0">{children}</div>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => set(!open)}
          className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/25 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {open ? "Hide Banner" : "Show Banner"}
        </button>
      </div>
    </section>
  );
}

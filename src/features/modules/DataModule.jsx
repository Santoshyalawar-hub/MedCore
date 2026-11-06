import { useState, useMemo } from "react";
import { useAsync } from "../../shared/hooks/index.js";
import { api } from "../../core/api/http.js";
import {
  Card,
  Pill,
  Skeleton,
  ErrorState,
  EmptyState,
} from "../../shared/ui/index.jsx";
import Modal from "../../shared/ui/Modal.jsx";
import { useToast } from "../notifications/ToastContext.jsx";
import { useAuth } from "../../core/auth/AuthContext.jsx";
import { can } from "../../core/rbac.js";
import { MODULES } from "../../config/modules.js";
import { SCHEMAS } from "../../config/schemas.js";
const PAGE = 8,
  num = (v) => parseFloat(String(v).replace(/,/g, ""));
const csv = (cols, rows) =>
  [cols, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
function Field({ c, sc, v, on, ro, err }) {
  const opts = c === "Status" ? sc.status : sc.select?.[c];
  const t = sc.num?.includes(c) ? "number" : sc.type?.[c] || "text";
  return (
    <div>
      <label className="lbl">{c}</label>
      {opts ? (
        <select
          className="input"
          value={v}
          onChange={(e) => on(e.target.value)}
          disabled={ro}
        >
          <option value="">Select…</option>
          {opts.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          className="input"
          type={t}
          min={t === "number" ? 0 : undefined}
          value={v}
          readOnly={ro}
          onChange={(e) => on(e.target.value)}
        />
      )}
      {err && (
        <p className="err" role="alert">
          {err}
        </p>
      )}
    </div>
  );
}
export default function DataModule({ moduleKey }) {
  const { user } = useAuth();
  const toast = useToast();
  const m = MODULES[moduleKey];
  const sc = SCHEMAS[moduleKey] || {};
  const { data, loading, error, refetch } = useAsync(
    () => api.get("/" + moduleKey),
    [moduleKey],
  );
  const w = can(user, moduleKey, "write") && !sc.readOnly;
  const [q, setQ] = useState(""),
    [st, setSt] = useState(""),
    [sort, setSort] = useState({ i: null, d: 1 }),
    [page, setPage] = useState(1),
    [form, setForm] = useState(null),
    [view, setView] = useState(null),
    [del, setDel] = useState(null),
    [busy, setBusy] = useState(false);
  const si = data ? data.cols.indexOf("Status") : -1;
  const all = useMemo(() => {
    if (!data) return [];
    let r = data.rows;
    if (user.role === "patient") r = r.filter((x) => x.includes(user.name));
    const di = data.cols.indexOf("Doctor");
    if (user.role === "doctor" && moduleKey === "appointments" && di >= 0)
      r = r.filter((x) => x[di] === user.name);
    r = r.filter(
      (x) =>
        x.join(" ").toLowerCase().includes(q.toLowerCase()) &&
        (!st || x[si] === st),
    );
    if (sort.i != null)
      r = [...r].sort((a, b) => {
        const x = a[sort.i],
          y = b[sort.i];
        const n = num(x) - num(y);
        return (isNaN(n) ? String(x).localeCompare(String(y)) : n) * sort.d;
      });
    return r;
  }, [data, q, st, sort, user, si]);
  const pages = Math.max(1, Math.ceil(all.length / PAGE)),
    cur = Math.min(page, pages),
    rows = all.slice((cur - 1) * PAGE, cur * PAGE);
  const nextId = () =>
    sc.prefix +
    (Math.max(
      0,
      ...data.rows.map((r) => parseInt(String(r[0]).replace(/\D/g, "")) || 0),
    ) +
      1);
  const openNew = () =>
    setForm({
      mode: "new",
      v: data.cols.map((c, i) =>
        i === 0 && !sc.manualKey
          ? nextId()
          : c === "Status"
            ? sc.status[0]
            : "",
      ),
      er: {},
    });
  const validate = (v) => {
    const er = {};
    data.cols.forEach((c, i) => {
      const x = String(v[i]).trim();
      if (!x) er[c] = `${c} is required`;
      else if (sc.num?.includes(c) && (isNaN(num(x)) || num(x) < 0))
        er[c] = "Enter a valid number";
      else if (c === "Email" && !/^\S+@\S+\.\S+$/.test(x))
        er[c] = "Enter a valid email";
    });
    return er;
  };
  const done = async (fn, msg) => {
    setBusy(true);
    try {
      await fn();
      toast(msg);
      await refetch();
      return true;
    } catch (e) {
      toast(e.message, "err");
      return false;
    } finally {
      setBusy(false);
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    const er = validate(form.v);
    if (Object.keys(er).length) return setForm({ ...form, er });
    const row = form.v.map((x, i) =>
      sc.num?.includes(data.cols[i]) ? num(x) : String(x).trim(),
    );
    const ok = await done(
      () =>
        form.mode === "new"
          ? api.post("/" + moduleKey, { row })
          : api.patch(`/${moduleKey}/${encodeURIComponent(form.key)}`, { row }),
      form.mode === "new" ? "Record created" : "Record updated",
    );
    if (ok) setForm(null);
  };
  const setStatus = (r, s) =>
    done(
      () =>
        api.patch(`/${moduleKey}/${encodeURIComponent(r[0])}`, {
          row: r.map((c, i) => (i === si ? s : c)),
        }),
      `Status changed to ${s}`,
    );
  const exportCsv = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv(data.cols, all)], { type: "text/csv" }),
    );
    a.download = moduleKey + ".csv";
    a.click();
    toast("Exported " + all.length + " rows");
  };
  return (
    <Card
      title={m.title}
      action={
        <div className="flex gap-2 flex-wrap justify-end">
          <input
            className="input !w-44"
            placeholder="Search…"
            aria-label="Search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
          {si >= 0 && (
            <select
              className="input !w-40"
              aria-label="Filter by status"
              value={st}
              onChange={(e) => {
                setSt(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              {(sc.status || []).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          )}
          {data && (
            <button className="btn-o" onClick={exportCsv}>
              ⬇ CSV
            </button>
          )}
          {w ? (
            <button className="btn" onClick={openNew}>
              ＋ New
            </button>
          ) : (
            <span className="pill bg-slate-100 text-slate-600 self-center">
              {sc.readOnly ? "System log" : "Read-only"}
            </span>
          )}
        </div>
      }
    >
      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !rows.length ? (
        <EmptyState text="No records match your filters." />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  {data.cols.map((c, i) => (
                    <th
                      key={c}
                      className="py-2 pr-4"
                      aria-sort={
                        sort.i === i
                          ? sort.d > 0
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        onClick={() =>
                          setSort({ i, d: sort.i === i ? -sort.d : 1 })
                        }
                        className="font-semibold"
                      >
                        {c}
                        {sort.i === i ? (sort.d > 0 ? " ▲" : " ▼") : ""}
                      </button>
                    </th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r[0]} className="border-t">
                    {r.map((c, j) => (
                      <td key={j} className="py-2.5 pr-4">
                        {j === si ? <Pill>{c}</Pill> : c}
                      </td>
                    ))}
                    <td className="py-2 whitespace-nowrap space-x-1">
                      <button
                        className="btn-o !px-2 !py-1"
                        onClick={() => setView(r)}
                      >
                        View
                      </button>
                      {w && (
                        <>
                          <button
                            className="btn-o !px-2 !py-1"
                            onClick={() =>
                              setForm({
                                mode: "edit",
                                key: r[0],
                                v: [...r],
                                er: {},
                              })
                            }
                          >
                            Edit
                          </button>
                          {si >= 0 && (
                            <select
                              aria-label={"Change status of " + r[0]}
                              className="border rounded-lg text-xs py-1"
                              value=""
                              onChange={(e) =>
                                e.target.value && setStatus(r, e.target.value)
                              }
                            >
                              <option value="">Status…</option>
                              {sc.status
                                .filter((s) => s !== r[si])
                                .map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                            </select>
                          )}
                          <button
                            className="btn-o !px-2 !py-1 !text-red-700"
                            onClick={() => setDel(r)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-3 text-sm">
            <span className="text-slate-600">
              {all.length} record(s) · page {cur}/{pages}
            </span>
            <div className="space-x-2">
              <button
                className="btn-o"
                disabled={cur <= 1}
                onClick={() => setPage(cur - 1)}
              >
                Prev
              </button>
              <button
                className="btn-o"
                disabled={cur >= pages}
                onClick={() => setPage(cur + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
      {form && (
        <Modal
          title={(form.mode === "new" ? "New " : "Edit ") + m.title}
          onClose={() => setForm(null)}
        >
          <form onSubmit={submit} className="space-y-3" noValidate>
            {data.cols.map((c, i) => (
              <Field
                key={c}
                c={c}
                sc={sc}
                v={form.v[i]}
                err={form.er[c]}
                ro={i === 0 && (!sc.manualKey || form.mode === "edit")}
                on={(x) =>
                  setForm({
                    ...form,
                    v: form.v.map((y, k) => (k === i ? x : y)),
                  })
                }
              />
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="btn-o"
                onClick={() => setForm(null)}
              >
                Cancel
              </button>
              <button className="btn" disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {view && (
        <Modal title={m.title + " – " + view[0]} onClose={() => setView(null)}>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {data.cols.map((c, i) => (
              <div key={c}>
                <dt className="text-slate-500">{c}</dt>
                <dd className="font-medium">
                  {i === si ? <Pill>{view[i]}</Pill> : String(view[i])}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-slate-500 mt-4">
            Access to this record is audit-logged.
          </p>
        </Modal>
      )}
      {del && (
        <Modal title="Delete record?" onClose={() => setDel(null)}>
          <p className="text-sm">
            This will permanently remove <b>{del[0]}</b>. This action is
            recorded in the audit log.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <button className="btn-o" onClick={() => setDel(null)}>
              Cancel
            </button>
            <button
              className="btn !bg-red-700"
              disabled={busy}
              onClick={async () => {
                if (
                  await done(
                    () =>
                      api.del(`/${moduleKey}/${encodeURIComponent(del[0])}`),
                    "Record deleted",
                  )
                )
                  setDel(null);
              }}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </Card>
  );
}

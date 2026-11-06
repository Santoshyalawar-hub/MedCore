export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};
export const pillClass = (s) =>
  /(overdue|rejected|suspended|low stock|cancelled|flagged|urgent|leave|off$)/i.test(
    s,
  )
    ? "bg-red-100 text-red-800"
    : /(pending|processing|draft|trial|submitted|cleaning|collected|progress|admitted|occupied)/i.test(
          s,
        )
      ? "bg-amber-100 text-amber-800"
      : /(checked|active|paid|completed|dispensed|available|in stock|ready|approved|enabled|published|logged|delivered|confirmed)/i.test(
            s,
          )
        ? "bg-green-100 text-green-800"
        : "bg-slate-100 text-slate-700";
export const ymd = (d) =>
  d.getFullYear() +
  "-" +
  String(d.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(d.getDate()).padStart(2, "0");
const MINOR = /^(a|an|and|as|at|by|for|in|of|on|or|the|to|vs)$/i;
// Display-only title casing for labels (leaves acronyms such as HR / HMS untouched).
export const titleCase = (s) =>
  String(s ?? "").replace(/[A-Za-z][A-Za-z'’]*/g, (w, i) =>
    i > 0 && MINOR.test(w) ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1),
  );

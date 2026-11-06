import { useState } from "react";
import { useAsync } from "../../shared/hooks/index.js";
import { api } from "../../core/api/http.js";
import { Card, Skeleton, ErrorState } from "../../shared/ui/index.jsx";
const answer = (q) => {
  q = q.toLowerCase();
  return q.includes("revenue")
    ? "Revenue is up 8.4% week-on-week, driven by Cardiology (+14%). Overdue invoices total ₹18,500."
    : q.includes("bed") || q.includes("icu")
      ? "ICU is at 86% occupancy. Forecast: 92% within 24h. Two step-down beds can be freed by discharging GW-09 and GW-11."
      : q.includes("stock") || q.includes("inventory")
        ? "2 items are below reorder level: Insulin glargine (4 days left) and Surgical gloves (M). Draft POs can be created."
        : "I can answer questions on revenue, beds, stock, appointments and staffing.";
};
export default function AiInsightsPage() {
  const { data, loading, error, refetch } = useAsync(() => api.get("/ai"));
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  return (
    <div className="space-y-5">
      <Card title="Ask MedCore AI">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setA(answer(q));
          }}
        >
          <input
            className="input"
            placeholder="e.g. How is ICU occupancy trending?"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn">Ask</button>
        </form>
        {a && (
          <p className="mt-3 p-3 bg-primary-50 rounded-lg text-sm">✨ {a}</p>
        )}
      </Card>
      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map(([t, d, act, aud]) => (
            <Card key={t} title={"✨ " + t}>
              <p className="text-sm text-slate-700">{d}</p>
              <p className="text-xs text-slate-500 mt-2">Relevant to: {aud}</p>
              <button
                className="btn mt-3"
                onClick={() => alert(act)}
              >
                {act}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

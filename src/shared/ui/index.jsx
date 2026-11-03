import {pillClass} from "../utils/index.js";
export const Card=({title,action,children,className=""})=><section className={"card "+className}>{(title||action)&&<div className="flex justify-between items-center mb-3"><h2 className="font-semibold">{title}</h2>{action}</div>}{children}</section>;
export const Pill=({children})=><span className={"pill "+pillClass(String(children))}>{children}</span>;
export const Kpi=({label,value,delta,accent})=><div className="card" style={{borderTop:`3px solid ${accent}`}}><div className="text-sm text-slate-600">{label}</div><div className="text-2xl font-bold mt-1">{value}</div>{delta&&<div className={"text-xs mt-1 "+(delta.startsWith("-")?"text-red-700":"text-green-700")}>{delta.startsWith("-")?"▼":"▲"} {delta.replace(/^[+-]/,"")} vs last week</div>}</div>;
export const Skeleton=({n=4})=><div className="space-y-2" aria-busy="true">{Array.from({length:n},(_,i)=><div key={i} className="h-9 rounded bg-slate-200 animate-pulse"/>)}</div>;
export const EmptyState=({text})=><p className="text-sm text-slate-600 py-6 text-center">{text}</p>;
export const ErrorState=({error,onRetry})=><div role="alert" className="text-center py-6"><p className="text-red-700 font-medium">{error.message}</p><p className="text-xs text-slate-500">Code: {error.code}</p><button className="btn-o mt-3" onClick={onRetry}>Try again</button></div>;
export function DataTable({cols,rows,q=""}){const f=rows.filter(r=>r.join(" ").toLowerCase().includes(q.toLowerCase()));
 if(!f.length)return <EmptyState text="No records match your search."/>;
 return <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-slate-500"><tr>{cols.map(c=><th key={c} className="py-2 pr-4">{c}</th>)}</tr></thead><tbody>
 {f.map((r,i)=><tr key={i} className="border-t">{r.map((c,j)=><td key={j} className="py-2.5 pr-4">{cols[j]==="Status"?<Pill>{c}</Pill>:c}</td>)}</tr>)}</tbody></table></div>}

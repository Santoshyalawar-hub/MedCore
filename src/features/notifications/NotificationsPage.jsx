import { useNotify } from "./NotifyContext.jsx";
import { Card } from "../../shared/ui/index.jsx";
const ic = { critical: "🚨", info: "ℹ️", warning: "⚠️", ai: "✨" };
export default function NotificationsPage() {
  const { items, toggle, readAll } = useNotify();
  return (
    <Card
      title="Notification centre"
      action={
        <button className="btn-o" onClick={readAll}>
          Mark all read
        </button>
      }
    >
      <ul className="divide-y">
        {items.map((n) => (
          <li
            key={n.id}
            className={
              "py-3 flex gap-3 items-start " + (n.read ? "opacity-60" : "")
            }
          >
            <span>{ic[n.level]}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{n.text}</p>
              <p className="text-xs text-slate-500">{n.time}</p>
            </div>
            <button
              className="text-xs text-primary-600 underline"
              onClick={() => toggle(n.id)}
            >
              {n.read ? "Mark unread" : "Mark read"}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

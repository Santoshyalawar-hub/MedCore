import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../core/auth/AuthContext.jsx";
import { moduleState, basePath } from "../../core/rbac.js";
import { MODULES } from "../../config/modules.js";
import DataModule from "./DataModule.jsx";
import AiInsightsPage from "../ai/AiInsightsPage.jsx";
import AutomationPage from "../automation/AutomationPage.jsx";
import NotificationsPage from "../notifications/NotificationsPage.jsx";
import SubscriptionPage, {
  UpgradePrompt,
} from "../subscription/SubscriptionPage.jsx";
import ProfilePage from "../profile/ProfilePage.jsx";
import Dashboard from "../dashboard/Dashboard.jsx";
import {
  Applications,
  Hospitals,
  PlansPage,
  Demos,
  Outbox,
} from "../platform/PlatformPages.jsx";
import SetupPage from "../setup/SetupPage.jsx";
import EmployeesPage from "../employees/EmployeesPage.jsx";
import MyAppointments from "../patient/MyAppointments.jsx";
const CUSTOM = {
  setup: SetupPage,
  users: EmployeesPage,
  myAppointments: MyAppointments,
  registrations: Applications,
  tenants: Hospitals,
  plans: PlansPage,
  demoRequests: Demos,
  outbox: Outbox,
  dashboard: Dashboard,
  ai: AiInsightsPage,
  automation: AutomationPage,
  notifications: NotificationsPage,
  subscription: SubscriptionPage,
  profile: ProfilePage,
};
export const Msg = ({ t, home }) => (
  <div className="text-center py-20">
    <h1 className="text-2xl font-bold">{t}</h1>
    <Link className="btn mt-5" to={home}>
      Back to dashboard
    </Link>
  </div>
);
export default function ModulePage({ moduleKey }) {
  const { user, tenant } = useAuth();
  const p = useParams();
  const key = moduleKey || p.module;
  const home = basePath(user) + "/dashboard";
  if (!MODULES[key]) return <Msg t="404 – Page not found" home={home} />;
  const s = moduleState(user, tenant, key);
  if (s === "forbidden")
    return <Msg t="403 – You do not have access to this module." home={home} />;
  if (s === "upgrade") return <UpgradePrompt feature={MODULES[key].feature} />;
  const C = CUSTOM[key];
  return C ? <C /> : <DataModule moduleKey={key} />;
}

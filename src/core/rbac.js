import {ROLES} from "../config/roles.js";import {MODULES} from "../config/modules.js";
import {getPlans} from "../mocks/store.js"; // entitlements come from /me in production
export const access=(user,key)=>ROLES[user.role]?.access[key]||null;
export const can=(user,key,action="read")=>{const a=access(user,key);return action==="read"?!!a:a==="rw"};
export const featuresOf=t=>t?(t.features||getPlans()[t.plan]?.features||[]):[];
export const hasFeature=(t,f)=>!f||!t||featuresOf(t).includes(f);
export const moduleState=(user,tenant,key)=>!MODULES[key]||!can(user,key)?"forbidden":!hasFeature(tenant,MODULES[key].feature)?"upgrade":"ok";
export const navFor=user=>Object.keys(ROLES[user.role].access).filter(k=>MODULES[k]);
export const basePath=u=>u.role==="super_admin"?"/platform":u.role==="patient"?"/me":`/t/${u.tenant}`;

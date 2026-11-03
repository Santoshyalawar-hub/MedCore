// Business-rule layer ("the backend" for the demo). Every function authorises the caller, validates input, and scopes data to a tenant.
// Each export maps 1:1 to an endpoint in docs/API.md, so replacing it with a real HTTP call is mechanical.
import {load,save,uid,hash,getPlans} from "./store.js";import {AppError} from "../core/errors.js";import {getTable,setTable,logAudit} from "./adapter.js";import {hasFeature} from "../core/rbac.js";
import {ENV} from "../config/env.js";import {DB} from "./db.js";import {STAFF_ROLES,ROLES} from "../config/roles.js";import {ymd} from "../shared/utils/index.js";
const E=(s,c,m)=>new AppError(s,c,m),need=(c,m)=>{if(!c)throw E(422,"VALIDATION",m)},em=s=>/^\S+@\S+\.\S+$/.test(s||""),now=()=>new Date().toISOString();
const link=p=>location.href.split("#")[0]+"#"+p,demo=l=>ENV.useMocks?l:undefined;
const mail=(to,subject,body)=>load().outbox.unshift({id:uid("m"),at:now(),to,subject,body});
const notice=(to,text,level="info")=>load().notices.unshift({id:uid("n"),to,text,level,time:new Date().toTimeString().slice(0,5)});
const owner=u=>{if(u?.role!=="super_admin")throw E(403,"FORBIDDEN","Platform owner only")};
const admin=u=>{if(u?.role!=="hospital_admin"||!u.tenant)throw E(403,"FORBIDDEN","Hospital administrator only")};
const pwOk=p=>need(p&&p.length>=8&&/\d/.test(p),"Password needs 8+ characters including a number");
const OPEN=["Cancelled","Rejected"];
// ---------- public discovery (published + active tenants only; never exposes private data)
const live=()=>Object.values(load().tenants).filter(t=>t.published&&t.status==="active"&&hasFeature(t,"core"));
const depts=s=>getTable("departments",s).rows.filter(r=>r[3]==="Active").map(r=>r[1]);
const docs=s=>getTable("doctors",s).rows.filter(r=>r[7]==="Active"&&Number(r[4])>0).map(r=>({id:r[0],name:r[1],dept:r[2],qual:r[3],fee:Number(r[4]),days:r[5],hours:r[6],slug:s}));
const pub=t=>({slug:t.slug,code:t.code,name:t.name,type:t.type,city:t.city,state:t.state,description:t.description,hours:t.hours,services:t.services||[],phone:t.phone,email:t.email,autoConfirm:t.autoConfirm,specialties:depts(t.slug),doctorCount:docs(t.slug).length});
const has=(a,b)=>String(a).toLowerCase().includes(String(b||"").toLowerCase());
export const listHospitals=({q="",city="",specialty="",service=""}={})=>live().map(pub).filter(h=>(!q||has(h.name,q))&&(!city||has(h.city+" "+h.state,city))&&(!specialty||h.specialties.includes(specialty))&&(!service||h.services.includes(service)));
export function getHospital(slug){const t=live().find(x=>x.slug===slug);if(!t)throw E(404,"NOT_FOUND","Hospital not found");return {...pub(t),doctors:docs(slug).map(d=>({...d,next:nextSlot(d)}))}}
export const listDoctors=({q="",specialty="",city=""}={})=>live().flatMap(t=>docs(t.slug).map(d=>({...d,hospital:t.name,city:t.city}))).filter(d=>(!q||has(d.name,q))&&(!specialty||d.dept===specialty)&&(!city||has(d.city,city)));
const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const dayset=s=>{const o=new Set();for(const p of String(s).split(",")){const [a,b]=p.trim().split("-"),i=DAYS.indexOf(a),j=DAYS.indexOf(b);if(i<0)continue;if(!b||j<0){o.add(i);continue}for(let k=i;;k=(k+1)%7){o.add(k);if(k===j)break}}return o};
const mins=h=>{const [x,y]=h.split(":");return +x*60+ +y},fmt=m=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0");
export function getSlots(slug,doctorId,date){const d=docs(slug).find(x=>x.id===doctorId);if(!d)throw E(404,"NOT_FOUND","Doctor not available");
 const dt=new Date(date+"T00:00:00");if(isNaN(dt)||!dayset(d.days).has(dt.getDay()))return [];const [a,b]=d.hours.split("-");
 const taken=getTable("appointments",slug).rows.filter(r=>r[2]===d.name&&r[3]===date&&!OPEN.includes(r[5])).map(r=>r[4]);const out=[];
 for(let m=mins(a);m+30<=mins(b);m+=30){const t=fmt(m);out.push({time:t,free:!taken.includes(t)&&new Date(date+"T"+t+":00")>new Date()})}return out}
function nextSlot(d){for(let i=0;i<14;i++){const x=new Date();x.setDate(x.getDate()+i);const dt=ymd(x),s=getSlots(d.slug,d.id,dt).find(y=>y.free);if(s)return {date:dt,time:s.time}}return null}
// ---------- patient accounts & booking
export function registerPatient(f){const s=load();need(String(f.name||"").trim().length>=2,"Enter your name");need(em(f.email),"Enter a valid email");need(/^\d{10}$/.test(f.phone||""),"Phone must be 10 digits");pwOk(f.password);
 if(s.accounts.some(a=>a.email===f.email.trim().toLowerCase()))throw E(409,"DUPLICATE","An account with this email already exists. Please sign in.");
 s.accounts.push({email:f.email.trim().toLowerCase(),name:f.name.trim(),role:"patient",tenant:null,phone:f.phone,status:"active",hash:hash(f.password)});save()}
export function bookAppointment(user,{slug,doctorId,date,time}){
 if(user?.role!=="patient")throw E(403,"FORBIDDEN","Sign in as a patient to book");
 const t=load().tenants[slug];if(!t||!t.published||t.status!=="active"||!hasFeature(t,"core"))throw E(404,"NOT_FOUND","This hospital is not accepting bookings");
 const d=docs(slug).find(x=>x.id===doctorId);need(d,"Doctor unavailable");
 const sl=getSlots(slug,doctorId,date).find(x=>x.time===time);if(!sl||!sl.free)throw E(409,"SLOT_TAKEN","That slot is no longer available. Please choose another.");   // revalidated at commit time
 const tb=getTable("appointments",slug);if(tb.rows.some(r=>r[6]===user.email&&r[3]===date&&r[4]===time&&!OPEN.includes(r[5])))throw E(409,"DUPLICATE","You already have a booking at this time");
 const ref="APT-"+(Math.max(1000,...tb.rows.map(r=>parseInt(String(r[0]).replace(/\D/g,""))||0))+1),status=t.autoConfirm?"Confirmed":"Pending";
 setTable("appointments",slug,{...tb,rows:[[ref,user.name,d.name,date,time,status,user.email],...tb.rows]});logAudit(slug,user.name,"CREATE","appointments "+ref);
 notice("tenant:"+slug,`New appointment ${ref}: ${user.name} with ${d.name}, ${date} ${time} (${status})`);notice(user.email,`Appointment ${ref} at ${t.name} is ${status.toLowerCase()} for ${date} ${time}`);
 mail(user.email,`Appointment ${status.toLowerCase()} – ${t.name}`,`${ref}: ${d.name}, ${date} ${time}. Fee ₹${d.fee} payable at the hospital.`);save();return {ref,status,hospital:t.name,doctor:d.name,date,time,fee:d.fee}}
export function myAppointments(user){return Object.values(load().tenants).flatMap(t=>getTable("appointments",t.slug).rows.filter(r=>r[6]===user.email).map(r=>({slug:t.slug,hospital:t.name,ref:r[0],doctor:r[2],date:r[3],time:r[4],status:r[5]}))).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time))}
export function cancelMine(user,slug,ref){const tb=getTable("appointments",slug),r=tb.rows.find(x=>x[0]===ref&&x[6]===user.email);if(!r)throw E(404,"NOT_FOUND","Appointment not found");
 if(!["Pending","Confirmed"].includes(r[5]))throw E(409,"STATE","This appointment can no longer be cancelled");
 if(new Date(r[3]+"T"+r[4]+":00")-Date.now()<2*36e5)throw E(409,"POLICY","Cancellations are allowed up to 2 hours before the appointment");
 setTable("appointments",slug,{...tb,rows:tb.rows.map(x=>x===r?[...r.slice(0,5),"Cancelled",r[6]]:x)});logAudit(slug,user.name,"CANCEL","appointments "+ref);notice("tenant:"+slug,`Patient cancelled ${ref}`,"warning");save()}
// ---------- hospital registration & onboarding
const slugify=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
export function registerHospital(f){const s=load();
 for(const k of ["name","type","email","phone","address","city","state","postal","repName","repDesignation","plan","departments"])need(String(f[k]||"").trim(),`${k} is required`);
 need(em(f.email),"Enter a valid email");need(/^\d{10}$/.test(f.phone),"Phone must be 10 digits");need(s.plans[f.plan],"Choose a valid plan");need(f.consent,"Consent is required");
 const L=x=>x.toLowerCase();if(s.registrations.some(r=>r.status!=="rejected"&&(L(r.email)===L(f.email)||L(r.name)===L(f.name)))||Object.values(s.tenants).some(t=>L(t.email)===L(f.email)||L(t.name)===L(f.name)))throw E(409,"DUPLICATE","A hospital with this name or email is already registered");
 const r={...f,consent:true,id:"REG-"+(1001+s.registrations.length),status:"pending_verification",at:now(),emailVerified:false,verifyToken:uid("v")};s.registrations.push(r);
 const l=link("/verify/"+r.verifyToken);mail(r.email,"Verify your hospital registration",`Hello ${r.repName}, please confirm your email: ${l}`);save();return {id:r.id,demoLink:demo(l)}}
export function verifyEmail(token){const r=load().registrations.find(x=>x.verifyToken===token);if(!r)throw E(400,"INVALID_LINK","This link is invalid.");r.emailVerified=true;if(r.status==="pending_verification")r.status="under_review";save();return {name:r.name}}
export const listRegistrations=u=>{owner(u);return load().registrations.map(({verifyToken,...r})=>r)};
function activate(s,r,basis,features,actor){const plan=s.plans[r.plan];if(plan.custom)need(features?.length,"Select the approved features for the Custom plan");
 const email=r.email.toLowerCase();if(s.accounts.some(a=>a.email===email))throw E(409,"DUPLICATE","An account with this email already exists");
 let slug=slugify(r.name)||"hospital",n=2;if(slug==="platform")slug="platform-hospital";const base=slug;while(s.tenants[slug])slug=base+"-"+n++;
 s.tenants[slug]={slug,code:"HSP-"+(1001+Object.keys(s.tenants).length),name:r.name,type:r.type,city:r.city,state:r.state,address:r.address,email,phone:r.phone,plan:r.plan,features:plan.custom?features:undefined,status:"active",subscription:basis,
  trialUntil:basis==="trial"?ymd(new Date(Date.now()+30*864e5)):undefined,published:false,autoConfirm:true,description:"",hours:"",services:[],profileConfirmed:false,workflowsReviewed:false};
 setTable("departments",slug,{cols:DB.departments.cols,rows:r.departments.split(",").map(x=>x.trim()).filter(Boolean).map((x,i)=>["DEP-"+(i+1),x,"—","Active"])});
 const token=uid("inv");s.invitations.push({token,type:"activate",email,expires:Date.now()+72*36e5,used:false});s.accounts.push({email,name:r.repName,role:"hospital_admin",tenant:slug,status:"invited",hash:null});
 const l=link("/activate/"+token);mail(email,`Welcome to MedCore – activate ${r.name}`,`Hospital code ${s.tenants[slug].code}. Set your password (valid 72 hours): ${l} · Login: ${link("/login")}`);
 r.status="approved";r.tenantSlug=slug;logAudit(null,actor,"TENANT_CREATED",slug);return {slug,demoLink:demo(l)}}
export function reviewRegistration(u,id,{decision,note="",basis,features}){owner(u);const s=load(),r=s.registrations.find(x=>x.id===id);need(r,"Application not found");let out={};
 if(decision==="approve"){if(r.tenantSlug)return {slug:r.tenantSlug};need(r.emailVerified,"The hospital has not verified its email yet");need(["payment","trial","contract"].includes(basis),"Choose how the subscription is activated");out=activate(s,r,basis,features,u.name)}
 else if(decision==="reject"){r.status="rejected";r.note=note;mail(r.email,"Your MedCore application",`We could not approve your application. ${note}`)}
 else if(decision==="more_info"){need(note.trim(),"Say what information is needed");r.status="more_info";r.note=note;mail(r.email,"More information required",note)}
 else throw E(422,"VALIDATION","Unknown decision");logAudit(null,u.name,"REVIEW_"+decision.toUpperCase(),id);save();return out}
export function acceptToken(type,token,password){const s=load(),i=s.invitations.find(x=>x.token===token&&x.type===type);
 if(!i||i.used||i.expires<Date.now())throw E(400,"INVALID_LINK","This link is invalid or has expired.");pwOk(password);
 const a=s.accounts.find(x=>x.email===i.email);need(a,"Account not found");a.hash=hash(password);if(a.status==="invited")a.status="active";i.used=true;save();return {email:a.email}}
export function requestReset(email){const s=load(),a=s.accounts.find(x=>x.email===String(email).trim().toLowerCase()&&x.status==="active");let l;
 if(a){const token=uid("rst");s.invitations.push({token,type:"reset",email:a.email,expires:Date.now()+60*6e4,used:false});l=link("/reset/"+token);mail(a.email,"Reset your password","Reset link (valid 1 hour): "+l);save()}return {demoLink:demo(l)}} // same response whether or not the account exists
export function loginAccount(email,pw){const s=load(),e=String(email).trim().toLowerCase(),at=s.attempts[e]||{n:0,until:0};
 if(at.until>Date.now())throw E(429,"LOCKED","Too many attempts. Try again in a minute.");const a=s.accounts.find(x=>x.email===e);
 if(!a||!a.hash||a.hash!==hash(pw)){if(a?.status==="invited")throw E(403,"NOT_ACTIVE","Account not activated yet. Use the activation link from your invitation email.");at.n++;if(at.n>=5){at.until=Date.now()+60000;at.n=0}s.attempts[e]=at;save();throw E(401,"INVALID","Invalid email or password.")}
 if(a.status!=="active")throw E(403,"DEACTIVATED","This account is deactivated. Contact your administrator.");
 if(a.tenant){const t=s.tenants[a.tenant];if(!t||t.status!=="active")throw E(403,"TENANT_SUSPENDED","Your hospital's subscription is not active. Contact support.")}
 s.attempts[e]={n:0,until:0};save();return {email:a.email,name:a.name,role:a.role,tenant:a.tenant||null}}
// ---------- employees
export function listEmployees(u){if(!["hospital_admin","management","hr_manager"].includes(u.role))throw E(403,"FORBIDDEN","Not allowed");return load().accounts.filter(a=>a.tenant===u.tenant).map(a=>({name:a.name,email:a.email,role:a.role,status:a.status,empId:a.empId||"—",dept:a.dept||"—"}))}
export function inviteEmployee(u,f){admin(u);const s=load();need(String(f.name||"").trim().length>=2,"Enter the employee name");need(em(f.email),"Enter a valid email");need(STAFF_ROLES.includes(f.role)||f.role==="hospital_admin","Choose a valid role");
 const email=f.email.trim().toLowerCase();if(s.accounts.some(a=>a.email===email))throw E(409,"DUPLICATE","This email already has an account");
 const token=uid("inv");s.invitations.push({token,type:"activate",email,expires:Date.now()+72*36e5,used:false});s.accounts.push({email,name:f.name.trim(),role:f.role,tenant:u.tenant,status:"invited",hash:null,empId:f.empId||"",dept:f.dept||""});
 if(f.role==="doctor"){const tb=getTable("doctors",u.tenant);setTable("doctors",u.tenant,{...tb,rows:[["D-"+(tb.rows.length+1),f.name.trim(),f.dept||"General Medicine","",0,"Mon-Fri","09:00-13:00","Inactive"],...tb.rows]})}   // inactive until fee/hours are configured
 const t=s.tenants[u.tenant],l=link("/activate/"+token);mail(email,`You are invited to ${t.name}`,`Role: ${ROLES[f.role].label}. Hospital code ${t.code}. Activate: ${l}`);logAudit(u.tenant,u.name,"INVITE",email);save();return {demoLink:demo(l)}}
export function setAccountStatus(u,email,status){admin(u);const a=load().accounts.find(x=>x.email===email);if(!a||a.tenant!==u.tenant)throw E(404,"NOT_FOUND","Employee not found");
 need(a.email!==u.email,"You cannot change your own account");need(["active","deactivated"].includes(status)&&a.status!=="invited","Invalid change");a.status=status;logAudit(u.tenant,u.name,status.toUpperCase(),email);save()}
// ---------- hospital setup & profile
export function setupStatus(u){const s=load(),t=s.tenants[u.tenant],dep=depts(u.tenant).length,staff=s.accounts.filter(a=>a.tenant===u.tenant).length,fees=docs(u.tenant).length,beds=getTable("beds",u.tenant).rows.length;
 const st=[["profile","Confirm hospital profile",t.profileConfirmed,"setup"],["departments","Add departments & specialties",dep>0,"departments"],["hours","Set operating hours",!!t.hours,"setup"],["staff","Invite doctors & staff",staff>1,"users"],["roles","Assign roles & permissions (done once staff are invited)",staff>1,"users"],
  ["fees","Configure doctors: fees & appointment slots",fees>0,"doctors"],["beds","Configure beds & wards",beds>0,"beds"],["workflows","Review billing / pharmacy / lab features of your plan",!!t.workflowsReviewed,"subscription"],["public","Review & publish public profile",!!t.published,"setup"]];
 return [...st,["done","Setup complete",st.every(x=>x[2]),"dashboard"]].map(([key,label,done,module])=>({key,label,done,module}))}
export function updateTenantProfile(u,p){admin(u);const t=load().tenants[u.tenant];
 for(const k of ["description","hours","phone","autoConfirm","profileConfirmed","workflowsReviewed"])if(k in p)t[k]=p[k];if(p.services)t.services=p.services;
 if(p.published===true){const miss=[];if(!depts(u.tenant).length)miss.push("at least one active department");if(!docs(u.tenant).length)miss.push("one active doctor with a fee");if(!t.description?.trim())miss.push("a description");if(!t.hours?.trim())miss.push("operating hours");if(miss.length)throw E(422,"NOT_READY","Before publishing add: "+miss.join(", "));t.published=true}
 else if(p.published===false)t.published=false;logAudit(u.tenant,u.name,"PROFILE_UPDATE",t.slug);save()}
export const getTenant=u=>({...load().tenants[u.tenant]});
// ---------- platform owner
export const listTenants=u=>{owner(u);const s=load();return Object.values(s.tenants).map(t=>({...t,users:s.accounts.filter(a=>a.tenant===t.slug).length}))};
export function setTenantStatus(u,slug,status){owner(u);const t=load().tenants[slug];need(t&&["active","suspended","expired"].includes(status),"Invalid request");t.status=status;logAudit(null,u.name,"TENANT_"+status.toUpperCase(),slug);save()}
export function setTenantPlan(u,slug,plan,features){owner(u);const s=load(),t=s.tenants[slug];need(t&&s.plans[plan],"Invalid plan");if(s.plans[plan].custom)need(features?.length,"Select features for the Custom plan");t.plan=plan;t.features=s.plans[plan].custom?features:undefined;logAudit(null,u.name,"PLAN_CHANGE",`${slug} → ${plan}`);save()}
export function savePlan(u,key,p){owner(u);const s=load();need(s.plans[key]&&String(p.name).trim(),"Invalid plan");need(p.price===null||(!isNaN(p.price)&&p.price>=0),"Price must be a number ≥ 0 (or blank for quote)");s.plans[key]={...s.plans[key],...p};logAudit(null,u.name,"PLAN_UPDATE",key);save()}
export function requestDemo(f){const s=load();for(const k of ["name","org","email","phone","preference"])need(String(f[k]||"").trim(),`${k} is required`);need(em(f.email),"Enter a valid email");need(f.consent,"Consent is required");
 s.demos.unshift({id:"DEMO-"+(1001+s.demos.length),at:now(),...f,status:"New"});mail(f.email,"We received your demo request","Our team will contact you about: "+f.preference);save()}
export const listDemos=u=>{owner(u);return load().demos};export const listOutbox=u=>{owner(u);return load().outbox};
export const getPlansPublic=()=>getPlans();
// ---------- notifications & live dashboard metrics
export const notices=u=>load().notices.filter(n=>n.to===u.email||(u.tenant&&n.to==="tenant:"+u.tenant));
export function liveMetrics(u){const s=load();
 if(u.role==="super_admin"){const rg=s.registrations.filter(r=>["pending_verification","under_review","more_info"].includes(r.status));
  return {sub:"Live platform metrics",kpis:[["Active hospitals",Object.values(s.tenants).filter(t=>t.status==="active").length],["Applications to review",rg.length],["Demo requests (new)",s.demos.filter(d=>d.status==="New").length],["Plans configured",Object.keys(s.plans).length]].map(x=>[...x,"—"]),
   panels:[["Applications awaiting review","list",rg.length?rg.slice(0,5).map(r=>`${r.name}|${r.status.replace(/_/g," ")}`):["Nothing waiting|All clear"]]]}}
 if(u.role==="hospital_admin"){const ap=getTable("appointments",u.tenant).rows,today=ymd(new Date()),up=ap.filter(r=>r[3]>=today&&!OPEN.includes(r[5])&&r[5]!=="Completed").sort((a,b)=>(a[3]+a[4]).localeCompare(b[3]+b[4]));
  return {sub:"Live hospital metrics · "+s.tenants[u.tenant].name,kpis:[["Pending approvals",ap.filter(r=>r[5]==="Pending").length],["Today's appointments",ap.filter(r=>r[3]===today&&!OPEN.includes(r[5])).length],["Active doctors",docs(u.tenant).length],["Staff accounts",s.accounts.filter(a=>a.tenant===u.tenant).length]].map(x=>[...x,"—"]),
   panels:[["Upcoming appointments","list",up.length?up.slice(0,5).map(r=>`${r[1]} · ${r[2]}|${r[3]} ${r[4]}`):["No upcoming appointments|—"]],["Setup – still to do","list",setupStatus(u).filter(x=>!x.done).slice(0,4).map(x=>`${x.label}|To do`)]]}}
 if(u.role==="patient"){const m=myAppointments(u),today=ymd(new Date());return {sub:"Your appointments",kpis:[["Upcoming",m.filter(a=>a.date>=today&&["Pending","Confirmed"].includes(a.status)).length],["Completed",m.filter(a=>a.status==="Completed").length],["Hospitals visited",new Set(m.map(a=>a.slug)).size],["Cancelled",m.filter(a=>a.status==="Cancelled").length]].map(x=>[...x,"—"]),
   panels:[["Next appointments","list",m.filter(a=>a.date>=today&&["Pending","Confirmed"].includes(a.status)).slice(0,5).map(a=>`${a.hospital} · ${a.doctor}|${a.date} ${a.time}`).concat([]).length?m.filter(a=>a.date>=today&&["Pending","Confirmed"].includes(a.status)).slice(0,5).map(a=>`${a.hospital} · ${a.doctor}|${a.date} ${a.time}`):["No upcoming appointments|Find a hospital to book"]]]}}
 return null}

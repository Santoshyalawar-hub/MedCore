import {Routes,Route,Navigate,useParams} from "react-router-dom";import {useAuth} from "../core/auth/AuthContext.jsx";import {ROLES} from "../config/roles.js";import {basePath} from "../core/rbac.js";
import IdleGuard from "./IdleGuard.jsx";import Login from "../features/auth/Login.jsx";import ModulePage,{Msg} from "../features/modules/ModulePage.jsx";
import PlatformLayout from "../layouts/PlatformLayout.jsx";import ExecutiveLayout from "../layouts/ExecutiveLayout.jsx";import ClinicalLayout from "../layouts/ClinicalLayout.jsx";import FrontLayout from "../layouts/FrontLayout.jsx";
import PublicLayout from "../features/public/PublicLayout.jsx";import Home from "../features/public/Home.jsx";import {Hospitals,HospitalProfile,Doctors,Compare,Book} from "../features/public/Discovery.jsx";
import {RegisterHospital,RequestDemo,TokenPage,Forgot,PatientSignup} from "../features/public/Forms.jsx";import {Services,HowItWorks,About,Contact,Privacy,Terms,Faq} from "../features/public/Static.jsx";
const LAYOUTS={platform:PlatformLayout,executive:ExecutiveLayout,clinical:ClinicalLayout,front:FrontLayout};
// Route guard: authenticated + correct workspace for the account (platform / patient portal / own tenant slug); then the role's layout.
function Shell({mode}){const {user}=useAuth();const {slug}=useParams();
 if(!user)return <Navigate to="/login" replace/>;
 const ok=mode==="platform"?user.role==="super_admin":mode==="patient"?user.role==="patient":(user.role!=="super_admin"&&user.role!=="patient"&&slug===user.tenant);
 if(!ok)return <Msg t="403 – Wrong workspace for your account." home={basePath(user)+"/dashboard"}/>;
 const L=LAYOUTS[ROLES[user.role].layout];return <><IdleGuard/><L/></>}
const inner=<><Route index element={<Navigate to="dashboard" replace/>}/><Route path=":module" element={<ModulePage/>}/></>;
export default function App(){const {user}=useAuth();
 return <Routes>
  <Route element={<PublicLayout/>}><Route path="/" element={<Home/>}/><Route path="/hospitals" element={<Hospitals/>}/><Route path="/hospitals/:slug" element={<HospitalProfile/>}/><Route path="/doctors" element={<Doctors/>}/><Route path="/compare" element={<Compare/>}/>
   <Route path="/book/:slug/:doctorId" element={<Book/>}/><Route path="/services" element={<Services/>}/><Route path="/how-it-works" element={<HowItWorks/>}/><Route path="/about" element={<About/>}/><Route path="/contact" element={<Contact/>}/>
   <Route path="/register-hospital" element={<RegisterHospital/>}/><Route path="/request-demo" element={<RequestDemo/>}/><Route path="/signup" element={<PatientSignup/>}/><Route path="/privacy" element={<Privacy/>}/><Route path="/terms" element={<Terms/>}/><Route path="/faq" element={<Faq/>}/></Route>
  <Route path="/login" element={user?<Navigate to={basePath(user)+"/dashboard"} replace/>:<Login/>}/><Route path="/forgot-password" element={<Forgot/>}/>
  <Route path="/activate/:token" element={<TokenPage kind="activate"/>}/><Route path="/reset/:token" element={<TokenPage kind="reset"/>}/><Route path="/verify/:token" element={<TokenPage kind="verify"/>}/>
  <Route path="/platform" element={<Shell mode="platform"/>}>{inner}</Route><Route path="/me" element={<Shell mode="patient"/>}>{inner}</Route><Route path="/t/:slug" element={<Shell mode="tenant"/>}>{inner}</Route>
  <Route path="*" element={<Msg t="404 – Page not found" home="/"/>}/></Routes>}

import {useEffect,useState} from "react";import {useNavigate} from "react-router-dom";import {useAuth} from "../core/auth/AuthContext.jsx";import {ENV} from "../config/env.js";import Modal from "../shared/ui/Modal.jsx";
// Session idle timeout: warn 1 min before, then sign out (VITE_SESSION_IDLE_MINUTES).
export default function IdleGuard(){const {logout}=useAuth();const go=useNavigate();const [warn,setWarn]=useState(false);
 useEffect(()=>{const T=ENV.idleMinutes*60000;let a,b;const reset=()=>{clearTimeout(a);clearTimeout(b);setWarn(false);a=setTimeout(()=>setWarn(true),Math.max(T-60000,T/2));b=setTimeout(()=>{logout();go("/login")},T)};
  const ev=["keydown","click","scroll","touchstart"];ev.forEach(e=>addEventListener(e,reset));reset();return()=>{clearTimeout(a);clearTimeout(b);ev.forEach(e=>removeEventListener(e,reset))}},[]); // eslint-disable-line
 return warn?<Modal title="Still there?" onClose={()=>setWarn(false)}><p className="text-sm">For your security you will be signed out soon due to inactivity.</p><button className="btn mt-4" onClick={()=>setWarn(false)}>Stay signed in</button></Modal>:null}

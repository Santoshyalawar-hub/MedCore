import {createContext,useContext,useState,useEffect,useMemo} from "react";import {DB} from "../../mocks/db.js";import {useAuth} from "../../core/auth/AuthContext.jsx";import {notices} from "../../mocks/service.js";
const C=createContext({items:[],unread:0,toggle:()=>{},readAll:()=>{}});export const useNotify=()=>useContext(C);
export function NotifyProvider({children}){const {user}=useAuth();const [tick,setTick]=useState(0);const [read,setRead]=useState({});
 useEffect(()=>{const i=setInterval(()=>setTick(t=>t+1),3000);return()=>clearInterval(i)},[]);
 const items=useMemo(()=>{if(!user)return [];const dyn=notices(user);const st=user.tenant==="citycare"?DB.notifications.map(([text,level,time],i)=>({id:"s"+i,text,level,time})):[];return [...dyn,...st].map(n=>({...n,read:!!read[n.id]}))},[user,tick,read]);
 return <C.Provider value={{items,unread:items.filter(n=>!n.read).length,toggle:id=>setRead(r=>({...r,[id]:!r[id]})),readAll:()=>setRead(Object.fromEntries(items.map(n=>[n.id,true])))}}>{children}</C.Provider>}

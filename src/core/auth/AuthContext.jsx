import {createContext,useContext,useState} from "react";import {load} from "../../mocks/store.js";import {loginAccount} from "../../mocks/service.js";import {setApiContext} from "../api/http.js";
const C=createContext();export const useAuth=()=>useContext(C);
const read=()=>{try{return JSON.parse(sessionStorage.getItem("hms_session"))}catch{return null}};
const ctx=u=>setApiContext({tenant:u?.tenant||null,actor:u?.name||"system",role:u?.role||null});
export function AuthProvider({children}){const [user,setUser]=useState(()=>{const u=read();ctx(u);return u});
 const tenant=user?.tenant?load().tenants[user.tenant]||null:null;
 const login=(email,pw)=>{const s=loginAccount(email,pw);setUser(s);ctx(s);sessionStorage.setItem("hms_session",JSON.stringify(s));return s};
 const logout=()=>{setUser(null);ctx(null);sessionStorage.removeItem("hms_session")};
 return <C.Provider value={{user,tenant,login,logout}}>{children}</C.Provider>}

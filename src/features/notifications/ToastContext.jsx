import {createContext,useContext,useState,useCallback} from "react";
const C=createContext({push:()=>{}});export const useToast=()=>useContext(C);
export function ToastProvider({children}){const [t,set]=useState([]);
 const push=useCallback((msg,type="ok")=>{const id=Math.random();set(x=>[...x,{id,msg,type}]);setTimeout(()=>set(x=>x.filter(i=>i.id!==id)),3500)},[]);
 return <C.Provider value={{push}}>{children}<div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-50 space-y-2">{t.map(i=><div key={i.id} className={"rounded-lg px-4 py-2 text-sm shadow-lg text-white "+(i.type==="ok"?"bg-green-700":"bg-red-700")}>{i.type==="ok"?"✔ ":"✕ "}{i.msg}</div>)}</div></C.Provider>}

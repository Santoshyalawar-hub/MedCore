// Single HTTP client (GET/POST/PATCH/DELETE). Mock adapter used when VITE_USE_MOCKS=true; otherwise fetch with tenant + correlation headers.
import {ENV} from "../../config/env.js";import {AppError,normalize} from "../errors.js";import {mockRequest} from "../../mocks/adapter.js";
let ctx={tenant:null,token:null,actor:"system",role:null};export const setApiContext=c=>{ctx={...ctx,...c}};
export async function request(method,path,body){
 try{
  if(ENV.useMocks)return await mockRequest(method,path,ctx.tenant,body,ctx.actor,ctx.role);
  const r=await fetch(ENV.apiBase+path,{method,headers:{"Content-Type":"application/json",Authorization:"Bearer "+ctx.token,"X-Tenant-Id":ctx.tenant||"","X-Correlation-Id":crypto.randomUUID()},body:body?JSON.stringify(body):undefined,credentials:"include"});
  if(!r.ok)throw new AppError(r.status,"HTTP_"+r.status,r.statusText);return (await r.json()).data;
 }catch(e){throw normalize(e)}}
export const api={get:p=>request("GET",p),post:(p,b)=>request("POST",p,b),patch:(p,b)=>request("PATCH",p,b),del:p=>request("DELETE",p)};

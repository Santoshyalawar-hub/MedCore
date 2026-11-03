import {useEffect,useState,useCallback} from "react";import {normalize} from "../../core/errors.js";
// Minimal server-state hook; swap for TanStack Query without changing callers ({data,error,loading,refetch}).
export function useAsync(fn,deps=[]){const [s,set]=useState({data:null,error:null,loading:true});
 const run=useCallback(()=>{set(x=>({...x,loading:true,error:null}));fn().then(data=>set({data,error:null,loading:false})).catch(e=>set({data:null,error:normalize(e),loading:false}))},deps); // eslint-disable-line
 useEffect(run,[run]);return {...s,refetch:run}}
export function useDisclosure(init=false){const [open,set]=useState(init);return {open,show:()=>set(true),hide:()=>set(false),toggle:()=>set(o=>!o)}}

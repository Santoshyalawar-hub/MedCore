import {useEffect} from "react";
export default function Modal({title,onClose,children,wide}){
 useEffect(()=>{const h=e=>e.key==="Escape"&&onClose();window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h)},[onClose]);
 return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
  <div role="dialog" aria-modal="true" aria-label={title} className={"bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto p-5 "+(wide?"max-w-2xl":"max-w-md")}>
  <div className="flex justify-between mb-3"><h2 className="font-semibold text-lg">{title}</h2><button aria-label="Close" onClick={onClose}>✕</button></div>{children}</div></div>}

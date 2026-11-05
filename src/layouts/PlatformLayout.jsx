import {Outlet} from "react-router-dom";import {NavItems,MobileNav,UserBar} from "./parts.jsx";import {ENV} from "../config/env.js";import {Logo} from "../shared/ui/index.jsx";
// Global Super Admin: dark console, no tenant context.
export default function PlatformLayout(){return <div className="min-h-screen flex"><aside className="hidden md:block w-56 bg-slate-900 p-3 shrink-0"><div className="mb-4"><Logo tone="light" sub="Platform"/></div><NavItems tone="dark"/></aside>
 <div className="flex-1 min-w-0"><header className="bg-white border-b px-4 py-3 flex items-center"><span className="pill bg-indigo-100 text-indigo-800">Platform console · {ENV.name}</span><UserBar/></header><MobileNav/><main className="p-4 md:p-6"><Outlet/></main></div></div>}

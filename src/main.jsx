import {createRoot} from "react-dom/client";import {HashRouter} from "react-router-dom";
import "./index.css";import {Providers} from "./app/Providers.jsx";import App from "./app/App.jsx";
createRoot(document.getElementById("root")).render(<HashRouter><Providers><App/></Providers></HashRouter>);

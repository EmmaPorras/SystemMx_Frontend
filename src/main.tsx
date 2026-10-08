import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router";

import App from "./App";
import AuthProvider from "./auth/AuthProvider";
import "./i18n";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")!,
).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);

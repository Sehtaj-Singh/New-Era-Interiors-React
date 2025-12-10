// src/main.jsx
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const rootEl = document.getElementById("service-root");

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

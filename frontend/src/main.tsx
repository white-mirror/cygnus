﻿import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./styles/global.css";
import App from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("No se encontro el elemento root");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

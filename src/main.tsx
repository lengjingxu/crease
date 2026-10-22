import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/outfit/latin-400.css";
import "@fontsource/outfit/latin-500.css";
import "@fontsource/outfit/latin-600.css";
import "@fontsource/syne/latin-600.css";
import "@fontsource/syne/latin-700.css";
import "./styles.css";
import "./theme/studio.css";
import "./theme/references.css";
import { Studio } from "./components/studio/studio";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Studio />
  </React.StrictMode>,
);

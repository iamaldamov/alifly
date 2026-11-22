import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./auth/AuthContext";
import "./styles.css";
import "./forest-glass.css";
import "./experience-polish.css";
import "./lime-noir.css";
import "./premium-interaction.css";
import MotionEnhancements from "./MotionEnhancements";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <HelmetProvider>
        <AuthProvider>
          <>
            <App />
            <MotionEnhancements />
          </>
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Register the service worker only for the published production app.
// BASE_URL keeps the registration inside /alifly/ on GitHub Pages.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const serviceWorkerUrl = `${import.meta.env.BASE_URL}sw.js`;

    navigator.serviceWorker
      .register(serviceWorkerUrl, { scope: import.meta.env.BASE_URL })
      .catch((error: unknown) => {
        console.warn("ALIFLY: service worker registration failed.", error);
      });
  });
}

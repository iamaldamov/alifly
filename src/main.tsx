import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import "./styles.css";
import "./forest-glass.css";
import "./experience-polish.css";
import "./lime-noir.css";
import "./level-placement.css";
import "./premium-interaction.css";
import "./expanded-hero.css";
import "./lesson-experience-polish.css";
import "./reference-design.css";
import MotionEnhancements from "./MotionEnhancements";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/lessons" element={<App />} />
            <Route path="/lessons/*" element={<App />} />
            <Route path="/login" element={<App />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <MotionEnhancements />
        </>
      </AuthProvider>
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

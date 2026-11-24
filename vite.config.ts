import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages uses /alifly/; a separate root-domain host uses /.
  // Keep the existing production URL as the safe default.
  base: process.env.VITE_BASE_PATH || "/alifly/",
});

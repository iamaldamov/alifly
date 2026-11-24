import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import seoRoutes from "./seo/routes.json";
import { staticSeoPages, type SeoRoute } from "./seo/static-pages";

const SEO_ROUTES = seoRoutes as SeoRoute[];

export default defineConfig({
  plugins: [
    react(),
    staticSeoPages(SEO_ROUTES),
  ],
  base: "/alifly/",
});

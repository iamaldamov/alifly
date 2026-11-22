import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Sitemap from "vite-plugin-sitemap";
import { SEO_ROUTES } from "./seo/routes.json";
import { staticSeoPages } from "./seo/static-pages";

const sitemapRoutes = SEO_ROUTES.map((route) => `/alifly${route.path === "/" ? "/" : route.path}`);

export default defineConfig({
  plugins: [
    react(),
    staticSeoPages(SEO_ROUTES),
    Sitemap({
      hostname: "https://iamaldamov.github.io",
      dynamicRoutes: sitemapRoutes,
      outDir: "dist",
      readable: true,
      generateRobotsTxt: false,
    }),
  ],
  base: "/alifly/",
});

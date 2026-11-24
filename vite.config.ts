import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Sitemap from "vite-plugin-sitemap";
import seoRoutes from "./seo/routes.json";
import { staticSeoPages, type SeoRoute } from "./seo/static-pages";

const SEO_ROUTES = seoRoutes as SeoRoute[];
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

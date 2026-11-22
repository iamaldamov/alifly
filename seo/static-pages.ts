import type { Plugin } from "vite";
import type { SeoRoute } from "./routes";

const SITE_URL = "https://iamaldamov.github.io/alifly";
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

export function staticSeoPages(routes: SeoRoute[]): Plugin {
  return {
    name: "alifly-static-seo-pages",
    apply: "build",
    generateBundle() {
      for (const route of routes) {
        if (route.path === "/") continue; // Vite's index.html remains the canonical homepage.
        const path = route.path.replace(/^\\/+|\\/+$/g, "");
        const fileName = path ? `${path}/index.html` : "index.html";
        const canonical = `${SITE_URL}${route.path}`;
        const title = escapeHtml(route.title);
        const description = escapeHtml(route.description);
        const heading = escapeHtml(route.h1);
        const summary = escapeHtml(route.summary);
        const arabic = route.arabic ? `<p class="arabic" lang="ar" dir="rtl">${escapeHtml(route.arabic)}</p>` : "";
        const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="index,follow">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:site_name" content="ALIFLY"><meta property="og:locale" content="ru_RU"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}">
</head>
<body><main><p><a href="/alifly/">ALIFLY</a> / <a href="/alifly/lessons/">Уроки</a></p><h1>${heading}</h1>${arabic}<p>${summary}</p><p>ALIFLY помогает изучать арабский язык постепенно: знакомиться с буквами, разбирать произношение и закреплять материал практикой.</p><p><a href="/alifly/">Открыть ALIFLY</a></p></main></body>
</html>`;
        this.emitFile({ type: "asset", fileName, source: html });
      }
    },
  };
}

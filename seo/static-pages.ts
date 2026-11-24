import type { Plugin } from "vite";
export type SeoRoute = { path: string; title: string; description: string; h1: string; summary: string; kind: "home" | "hub" | "letter" | "lesson"; arabic?: string; subject?: string };

const SITE_URL = "https://iamaldamov.github.io/alifly";
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

export function staticSeoPages(routes: SeoRoute[]): Plugin {
  return {
    name: "alifly-static-seo-pages",
    apply: "build",
    generateBundle(_options, bundle) {
      const entryChunk = Object.values(bundle).find((item) => item.type === "chunk" && item.isEntry);
      const cssLinks = Object.values(bundle)
        .filter((item) => item.type === "asset" && item.fileName.endsWith(".css"))
        .map((item) => `<link rel="stylesheet" crossorigin href="/alifly/${item.fileName}">`)
        .join("\n");
      if (!entryChunk) throw new Error("ALIFLY: Vite entry bundle was not found for static SEO routes.");
      const siteBase = "https://iamaldamov.github.io/alifly";
      const sitemapUrls = routes.map((route) => {
        const path = route.path === "/" ? "/" : route.path;
        const location = `${siteBase}${path}`;
        return `  <url><loc>${escapeHtml(location)}</loc></url>`;
      }).join("\n");
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>`,
      });
      for (const route of routes) {
        if (route.path === "/") continue; // Vite's index.html remains the canonical homepage.
        const path = route.path.split("/").filter(Boolean).join("/");
        const fileName = path ? `${path}/index.html` : "index.html";
        const canonical = `${SITE_URL}${route.path}`;
        const title = escapeHtml(route.title);
        const description = escapeHtml(route.description);
        const heading = escapeHtml(route.h1);
        const summary = escapeHtml(route.summary);
        const arabic = route.arabic ? `<p class="arabic" lang="ar" dir="rtl">${escapeHtml(route.arabic)}</p>` : "";
        const hubLinks = route.kind === "hub"
          ? `<section><h2>Буквы арабского алфавита</h2><ul>${routes.filter((item) => item.kind === "letter").map((item) => `<li><a href="/alifly${item.path}">${escapeHtml(item.h1)}</a></li>`).join("")}</ul><h2>Учебные уроки</h2><ul>${routes.filter((item) => item.kind === "lesson").map((item) => `<li><a href="/alifly${item.path}">${escapeHtml(item.h1)}</a></li>`).join("")}</ul></section>`
          : "";
        const interactive = route.kind === "hub" || route.path === "/lessons/alif/";
        const appAssets = interactive ? `${cssLinks}\n` : "";
        const appMount = interactive
          ? `<div id="root"></div><noscript><main><h1>${heading}</h1>${arabic}<p>${summary}</p></main></noscript><script type="module" crossorigin src="/alifly/${entryChunk.fileName}"></script>`
          : `<main><p><a href="/alifly/">ALIFLY</a> / <a href="/alifly/lessons/">Уроки</a></p><h1>${heading}</h1>${arabic}<p>${summary}</p><p>ALIFLY помогает изучать арабский язык постепенно: знакомиться с буквами, разбирать произношение и закреплять материал практикой.</p><p><a href="/alifly/">Открыть ALIFLY</a></p>${hubLinks}</main>`;
        const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="index,follow">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:site_name" content="ALIFLY"><meta property="og:locale" content="ru_RU"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}">
${appAssets}</head>
<body>${appMount}</body>
</html>`;
        this.emitFile({ type: "asset", fileName, source: html });
      }
    },
  };
}

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const outputDir = resolve("dist");
const indexFile = resolve(outputDir, "index.html");
const fallbackFile = resolve(outputDir, "404.html");
const indexHtml = await readFile(indexFile, "utf8");

await mkdir(dirname(fallbackFile), { recursive: true });
await copyFile(indexFile, fallbackFile);

const routePages = [
  {
    path: "lessons",
    title: "Уроки арабского языка с нуля | ALIFLY",
    description: "Последовательные бесплатные уроки арабского языка для начинающих: алфавит, огласовки, чтение и практика.",
    canonical: "https://iamaldamov.github.io/alifly/lessons",
  },
  {
    path: "lessons/alif",
    title: "Алиф — первая буква арабского алфавита | ALIFLY",
    description: "Изучи арабскую букву алиф: форма, название, произношение и первое упражнение в интерактивном уроке ALIFLY.",
    canonical: "https://iamaldamov.github.io/alifly/lessons/alif",
  },
  {
    path: "login",
    title: "Вход в аккаунт ALIFLY | Сохранение прогресса",
    description: "Войди в аккаунт ALIFLY, чтобы синхронизировать прогресс и продолжать обучение на разных устройствах.",
    canonical: "https://iamaldamov.github.io/alifly/login",
    robots: "noindex, nofollow",
  },
];

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function replaceTag(html, pattern, replacement) {
  if (!pattern.test(html)) {
    throw new Error(\`Could not find expected HTML metadata pattern: \${pattern}\`);
  }
  return html.replace(pattern, replacement);
}

for (const route of routePages) {
  const title = escapeAttribute(route.title);
  const description = escapeAttribute(route.description);
  const canonical = escapeAttribute(route.canonical);
  const robots = route.robots ?? "index, follow, max-image-preview:large";

  let html = indexHtml;
  html = replaceTag(html, /<title>[\\s\\S]*?<\\/title>/, \`<title>\${title}</title>\`);
  html = replaceTag(html, /<meta\\s+name="description"[\\s\\S]*?\\/>/, \`<meta name="description" content="\${description}" />\`);
  html = replaceTag(html, /<meta\\s+name="robots"[^>]*\\/>/, \`<meta name="robots" content="\${robots}" />\`);
  html = replaceTag(html, /<link\\s+rel="canonical"[^>]*\\/>/, \`<link rel="canonical" href="\${canonical}" />\`);
  html = replaceTag(html, /<meta\\s+property="og:title"[^>]*\\/>/, \`<meta property="og:title" content="\${title}" />\`);
  html = replaceTag(html, /<meta\\s+property="og:description"[\\s\\S]*?\\/>/, \`<meta property="og:description" content="\${description}" />\`);
  html = replaceTag(html, /<meta\\s+property="og:url"[^>]*\\/>/, \`<meta property="og:url" content="\${canonical}" />\`);
  html = replaceTag(html, /<meta\\s+name="twitter:title"[^>]*\\/>/, \`<meta name="twitter:title" content="\${title}" />\`);
  html = replaceTag(html, /<meta\\s+name="twitter:description"[\\s\\S]*?\\/>/, \`<meta name="twitter:description" content="\${description}" />\`);

  const destination = resolve(outputDir, route.path, "index.html");
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html, "utf8");
}

console.log("ALIFLY: created 404.html and static HTML entry points for public routes.");

# ALIFLY — SEO foundation

Дата: 22 ноября 2026  
Сайт: https://iamaldamov.github.io/alifly/

## Что добавлено в этой ветке

- Единый каталог из 46 публичных маршрутов: главная, каталог, 28 букв и 16 уроков — `seo/routes.json`.
- Генератор отдельных статических HTML-страниц — `seo/static-pages.ts`. Страницы создаются во время Vite build, без изменения React-компонентов и Firebase.
- Генерация sitemap.xml через `vite-plugin-sitemap`; маршруты для карты берутся из того же JSON.
- SEO-карта с title, description и H1 — `seo/metadata.csv`.
- Шаблон Open Graph и Twitter Card — `seo/dynamic-meta-template.html`.
- `public/robots.txt` уже присутствует в основной ветке и разрешает обход; в нём указан sitemap.

## Структура публичных URL

- Главная: `/alifly/`
- Каталог: `/alifly/lessons/`
- Страницы букв: `/alifly/lessons/{slug}/`
- Страницы учебных уроков: `/alifly/study/{slug}/`

Вложенные страницы — самостоятельные HTML-документы с уникальными title, description, canonical, H1, OG и Twitter metadata. Каталог содержит внутренние ссылки на страницы букв и уроков. Главная страница остаётся исходным `index.html`.

## GitHub Pages: ограничение robots.txt

Это GitHub Pages project site, размещённый в подпути `/alifly/`. Файл из репозитория публикуется как `https://iamaldamov.github.io/alifly/robots.txt`, тогда как поисковые роботы обычно запрашивают `https://iamaldamov.github.io/robots.txt` в корне origin. Репозиторий проекта не может создать или изменить origin-level robots.txt. Для этого нужен корневой Pages-репозиторий аккаунта либо собственный домен.

## Локальная проверка после получения ветки

1. Выполнить `npm install`.
2. Выполнить `npm run build`.
3. Убедиться, что появился `dist/sitemap.xml`.
4. Проверить `dist/robots.txt`.
5. Проверить наличие `dist/lessons/index.html`, всех 28 файлов `dist/lessons/{slug}/index.html` и всех 16 файлов `dist/study/{slug}/index.html`.
6. Проверить исходный HTML нескольких страниц: уникальные title, description, canonical, H1, OG и Twitter.
7. Запустить `npm run preview` и открыть URL напрямую, включая обновление страницы.

В этой сессии удалённый GitHub build не запускался: ветка и конфигурация подготовлены, но фактическое выполнение `npm install` и `npm run build` ещё требует CI или локального запуска.

## Google Search Console — действия владельца

1. Открыть https://search.google.com/search-console/.
2. Нажать «Добавить ресурс».
3. Выбрать «Ресурс с префиксом URL» и указать `https://iamaldamov.github.io/alifly/`.
4. Подтвердить владение способом, который предложит Search Console. Использовать только актуальный verification token, показанный сервисом.
5. Открыть «Файлы Sitemap» и отправить `sitemap.xml`.
6. В «Проверке URL» проверить главную, каталог, страницу буквы и страницу урока; запустить проверку опубликованной страницы.
7. После обработки следить за статусами страниц и отчётом об индексировании.
8. Проверить опубликованный XML через валидатор: https://emn178.github.io/online-tools/sitemap/validator/ — открыть sitemap.xml, вставить содержимое или загрузить файл и запустить Validate. Валидатор проверяет XML и протокол Sitemap, но не подтверждает доступность URL или их индексацию.

## Яндекс.Вебмастер — действия владельца

1. Открыть https://webmaster.yandex.ru/.
2. Добавить сайт `https://iamaldamov.github.io/alifly/`.
3. Подтвердить права методом, который предложит Вебмастер (HTML-файл или meta-тег). Не удалять существующие verification-теги.
4. В разделе Sitemap добавить `https://iamaldamov.github.io/alifly/sitemap.xml`.
5. Проверить несколько статических URL и статус обхода/индексации в инструментах Вебмастера.

## Что важно понимать

- Sitemap сообщает поисковику о URL, но не гарантирует их индексацию или позиции.
- Статические SEO-страницы дают поисковым роботам HTML с содержимым без необходимости запускать React.
- Основное SPA остаётся на главной странице; пользовательская авторизация и персональный прогресс не включены в SEO-страницы.
- До merge необходимо получить успешную сборку и проверить опубликованные страницы.

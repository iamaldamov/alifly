# ALIFLY — release readiness

Первичный снимок: 13 ноября 2026 года. Последняя актуализация: 18 ноября 2026 года.

Этот документ фиксирует проверяемое состояние проекта перед интеграцией изменений и публикацией. Он не означает, что перечисленные функции уже доступны на production.

## Текущее состояние GitHub

- Репозиторий: https://github.com/iamaldamov/alifly
- Production URL: https://iamaldamov.github.io/alifly/
- Основная ветка: `main`
- Проверенный HEAD `main`: `a982c069cac23c8f8050016f1d97c5c97b2fcb6f` (Forest Glass visual system).
- Сборка текущего HEAD `main`: [GitHub Actions #195](https://github.com/iamaldamov/alifly/actions/runs/43367127408) — успешно.
- Публикация текущего HEAD `main`: [GitHub Pages deployment #14](https://github.com/iamaldamov/alifly/actions/runs/43367127516) — успешно.
- Последняя проверка PR: [Build ALIFLY #200](https://github.com/iamaldamov/alifly/actions/runs/43745279843) для PR #21 — успешно; [Build ALIFLY #206](https://github.com/iamaldamov/alifly/actions/runs/43930158695) для PR #20 — успешно.
- Workflow сборки выполняет `npm install` и `npm run build`; скрипт build запускает `tsc --noEmit` и `vite build`. Отдельных SQL-, e2e- или браузерных тестов этот workflow не выполняет.

### Открытые PR и порядок интеграции

Состояние проверено 16 ноября 2026 года. В репозитории найдено восемь открытых PR.

| PR | Назначение | Состояние |
|---|---|---|
| [#7](https://github.com/iamaldamov/alifly/pull/7) | Welcome и представление автора | 2 коммита впереди, 7 позади; не Draft; GitHub сообщает `mergeable=false` |
| [#8](https://github.com/iamaldamov/alifly/pull/8) | Бренд, onboarding, регистрация, профиль, 7-дневный период | 21 впереди, 7 позади; не Draft; `mergeable=false` |
| [#9](https://github.com/iamaldamov/alifly/pull/9) | Устойчивый auth callback | Draft; основан на ветке PR #8, не независим от него |
| [#10](https://github.com/iamaldamov/alifly/pull/10) | Устойчивость синхронизации профиля | Draft; основан на ветке PR #8, не независим от него |
| [#17](https://github.com/iamaldamov/alifly/pull/17) | Инструкция настройки auth providers | Draft; 1 впереди, 1 позади; `mergeable=true` |
| [#18](https://github.com/iamaldamov/alifly/pull/18) | Мобильная компоновка и мини-игра слов | Draft; 19 впереди, 1 позади; `mergeable=true` |
| [#20](https://github.com/iamaldamov/alifly/pull/20) | Документация готовности к запуску | Draft; основан на текущей `main`; `mergeable=true` |
| [#21](https://github.com/iamaldamov/alifly/pull/21) | Ограничение SQL-привилегий таблицы прогресса | Draft; 2 впереди, 0 позади; `mergeable=true` |

Не объединять PR #9 и #10 напрямую в `main` до интеграции их базовой функциональности из PR #8. PR #7 и #8 сначала требуется согласовать с актуальной `main`: обе ветки отстают на семь коммитов и GitHub сейчас сообщает `mergeable=false`. PR #17 и #18 также основаны на более раннем состоянии `main`; перед интеграцией их следует обновить и перепроверить.

PR #18 содержит новый набор арабских слов, транскрипций и переводов в мини-игре. Эти учебные элементы требуют отдельной лингвистической проверки. Для PR #18 также нужна визуальная проверка на реальном iPhone.

## Supabase — проверенное состояние

- Проект `nmgyyrbqjfywxzweansj` отвечает со статусом `ACTIVE_HEALTHY`, регион `eu-west-1`, PostgreSQL 17.11.
- В списке применённых миграций присутствуют `20261106191401_create_user_progress` и `20261107114146_create_user_profiles_and_seven_day_trial`.
- Таблицы `public.user_progress` и `public.user_profiles` существуют; RLS включён на обеих.
- Найдено пять политик RLS. Политики SELECT/UPDATE/INSERT используют `auth.uid() = user_id` в соответствующих условиях.
- У `user_profiles` роль `anon` не имеет эффективных table-level привилегий. `authenticated` имеет SELECT; UPDATE разрешён только для `display_name`, `age`, `gender`, `avatar_id`. `trial_started_at` и `trial_ends_at` доступны для чтения, но не для UPDATE от `authenticated`.
- Триггер `on_auth_user_created_alifly_profile` существует на `auth.users` и вызывает `handle_new_alifly_user()`. Функция устанавливает начало пробного периода по `auth.users.created_at`, окончание — через семь дней.
- У `user_progress` сейчас избыточные эффективные привилегии у `anon` и `authenticated`, включая SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER и MAINTAIN. RLS остаётся включённым; политики строк для `user_progress` назначены только `authenticated` и ограничивают строки собственным `auth.uid()`. Это не является доказательством чтения чужих данных, но избыточные привилегии следует убрать как дополнительную границу безопасности.
- PR #21 содержит миграцию, которая отзывает привилегии у `PUBLIC`, `anon` и `authenticated`, затем выдаёт `authenticated` только SELECT/INSERT/UPDATE и проверяет table-level и column-level права. Миграция НЕ применялась к production.
- Для проверки поведения PostgreSQL был выполнен транзакционный smoke-test на временной таблице: до REVOKE были выданы table-level и column-level права, затем выполнены те же REVOKE/GRANT и проверки привилегий. Проверки завершились без исключений, транзакция была откатана. Повторный запрос подтвердил, что реальные привилегии `public.user_progress` не изменились. Это проверяет синтаксис и поведение REVOKE/GRANT, но не заменяет полный прогон миграции в отдельной тестовой базе.
- В проекте сейчас нет Supabase development branches.

### Supabase Advisors

- Security Advisor: предупреждение `auth_leaked_password_protection` — защита от скомпрометированных паролей выключена.
- Performance Advisor: замечаний нет.
- Health Advisor: замечаний нет.

### Требуется ручная настройка в Supabase Dashboard

1. Включить Leaked Password Protection и проверить политику паролей.
2. Проверить и при необходимости настроить Google OAuth и Apple OAuth credentials.
3. Настроить SMS provider credentials и проверить отправку/подтверждение OTP.
4. Проверить Auth URL Configuration: Site URL, Redirect URLs для GitHub Pages и email templates для magic-link.
5. После настройки выполнить реальные тесты регистрации, входа, повторного использования/истечения magic-link, SMS OTP и выхода на iPhone.

Наличие OAuth/SMS credentials и фактические параметры Dashboard этим аудитом не подтверждены. Не добавлять секреты в репозиторий или клиентский код.

## Оплата и production

- Платёжный провайдер не выбран и не подключается в рамках этого этапа.
- Не создавать checkout, не запускать списания и не считать клиентский таймер подтверждением оплаты.
- Реальный платёжный сценарий обсуждать только после выбора пользователем провайдера и получения необходимых настроек.

## Проверки, которые ещё нужны

- Прямой запрос к опубликованному URL в текущей среде проверки не завершился; фактическая доступность сайта остаётся неподтверждённой. Успешный Pages deployment #14 подтверждает завершение workflow публикации, но не заменяет внешний HTTP-проверочный запрос.
- Выполнить визуальную проверку актуального сайта на iPhone и проверить обновление Service Worker/cache после публикации.
- Проверить auth providers после ручной настройки Dashboard.
- Полностью применить и проверить миграцию PR #21 только в отдельной тестовой базе/ветке. Отдельная Supabase branch не создавалась; перед созданием требуется подтверждение пользователя, поскольку ветка тарифицируется.
- После обновления веток PR повторить build и review. Не объединять незавершённые PR и не запускать production deployment без отдельной проверки.

## Следующий безопасный приоритет

Сначала обновить и согласовать интеграционный порядок PR #7 и #8 относительно текущей `main`, затем переносить/проверять callback и profile-resilience изменения из PR #9 и #10. Параллельно завершить изолированную проверку миграции PR #21 после подтверждения пользователя на создание платной тестовой ветки. Не переписывать рабочие уроки и прогресс; не менять арабские тексты без надёжных источников и отдельной лингвистической проверки.


## Актуализация аудита — 17 ноября 2026 года

### GitHub и Actions

- Репозиторий доступен; default branch — `main`, проверенный HEAD по-прежнему `a982c069cac23c8f8050016f1d97c5c97b2fcb6f`.
- Найдено восемь открытых PR: #7, #8, #9, #10, #17, #18, #20 и #21.
- PR #7: 2 коммита впереди и 7 позади `main`; GitHub сообщает `mergeable=false`.
- PR #8: 21 коммит впереди и 7 позади `main`; GitHub сообщает `mergeable=false`.
- PR #17: 1 коммит впереди и 1 позади `main`; перед интеграцией требуется обновление базовой ветки.
- PR #18: 19 коммитов впереди и 1 позади `main`; перед интеграцией требуется обновление базовой ветки. Набор слов в мини-игре по-прежнему требует отдельной языковой проверки и проверки на iPhone.
- PR #9 и #10 остаются stacked PR, основанными на ветке PR #8.
- PR #20 и #21 основаны на текущем `main`, открыты как Draft и отмечены GitHub как mergeable. Они не объединялись.

Проверенные GitHub Actions:
- [Build ALIFLY #195](https://github.com/iamaldamov/alifly/actions/runs/43367127408) для HEAD `main` — успешно; шаги установки зависимостей и сборки завершились успешно.
- [GitHub Pages deployment #14](https://github.com/iamaldamov/alifly/actions/runs/43367127516) — успешно.
- [Build ALIFLY #190](https://github.com/iamaldamov/alifly/actions/runs/43274079163) для ветки PR #18 — успешно.
- [Build ALIFLY #200](https://github.com/iamaldamov/alifly/actions/runs/43745279843) для PR #21 — успешно.
- [Build ALIFLY #206](https://github.com/iamaldamov/alifly/actions/runs/43930158695) для PR #20 — успешно.
- Файл `.github/workflows/build.yml` подтверждает, что CI выполняет `npm install` и `npm run build`; отдельные SQL-, e2e- и браузерные тесты в этом workflow отсутствуют.
- Для PR #17 и PR #9/#10 новые результаты Actions в этой проверке не подтверждены.

### Дополнительная проверка Supabase

- Проект `nmgyyrbqjfywxzweansj` — `ACTIVE_HEALTHY`, PostgreSQL 17.11, регион `eu-west-1`.
- Список Supabase development branches пуст.
- У `user_profiles` эффективные table-level права роли `anon` отсутствуют. У `authenticated` есть SELECT и UPDATE только для `display_name`, `age`, `gender`, `avatar_id`; `trial_started_at` и `trial_ends_at` доступны для SELECT, но не UPDATE.
- На `auth.users` существует триггер `on_auth_user_created_alifly_profile`. Он вызывает `handle_new_alifly_user()`, функцию с `SECURITY DEFINER` и пустым `search_path`; функция создаёт профиль, задаёт начало trial по `auth.users.created_at` и окончание через семь дней.
- Для `user_progress` подтверждены избыточные эффективные table-level права у `anon` и `authenticated`, включая DELETE, TRUNCATE, REFERENCES, TRIGGER и MAINTAIN. Пять RLS-политик продолжают ограничивать строки собственным `auth.uid()`; миграция PR #21 ещё не применена.
- Security Advisor: единственное замечание — выключена Leaked Password Protection. Performance Advisor и Health Advisor не вернули замечаний.

### Публичный сайт

Прямое открытие `https://iamaldamov.github.io/alifly/` в текущей среде снова не удалось. Фактический внешний HTTP-ответ остаётся неподтверждённым; успешный Pages deployment подтверждает только успешное выполнение workflow публикации.

### Изменения в production

В ходе проверки 17 ноября production Supabase, `main` и опубликованный сайт не изменялись. PR не объединялись; OAuth/SMS credentials и платёжный провайдер не добавлялись; списания не запускались.

### Следующий безопасный шаг

1. Обновить PR #7, #8 и #17 относительно актуального `main` только после проверки diff и конфликтов.
2. Сохранить PR #9 и #10 stacked до согласования базовой функциональности PR #8.
3. Перед production применением PR #21 провести полное тестирование миграции в изолированной среде. Платную Supabase development branch без подтверждения стоимости не создавать.
4. После интеграции auth/profile вручную проверить регистрацию, callback, trial и профиль на iPhone.


## Актуализация аудита — 18 ноября 2026 года

### GitHub и GitHub Actions

- Репозиторий доступен, публичный, default branch — `main`.
- HEAD `main` подтверждён: `a982c069cac23c8f8050016f1d97c5c97b2fcb6f`. Новых коммитов в `main` после 13 ноября не обнаружено.
- Последняя успешная сборка `main`: [Build ALIFLY #195](https://github.com/iamaldamov/alifly/actions/runs/43367127408).
- Последняя успешная публикация: [GitHub Pages deployment #14](https://github.com/iamaldamov/alifly/actions/runs/43367127516).
- Для PR #20 актуальный HEAD — `43ea5b21afd18806de911244d8bdcd773664d876`; [Build ALIFLY #208](https://github.com/iamaldamov/alifly/actions/runs/44148180626) завершился успешно 17 ноября. Все шаги job, включая установку зависимостей и Build project, завершились успешно.
- Для PR #21 HEAD — `f2cb0d4b5734a6b560144593f55347cd86488e84`; последняя подтверждённая сборка — [Build ALIFLY #200](https://github.com/iamaldamov/alifly/actions/runs/43745279843), успешно.
- В списке Actions найдено 222 workflow runs; последний доступный запуск относится к PR #20 от 17 ноября. Новых запусков 18 ноября не обнаружено.
- Восьмёрка открытых PR не изменилась: #7, #8, #9, #10, #17, #18, #20 и #21.
- Сравнение веток с текущим `main`: PR #7 — 2 коммита впереди и 7 позади, `mergeable=false`; PR #8 — 21 впереди и 7 позади, `mergeable=false`; PR #17 — 1 впереди и 1 позади; PR #18 — 19 впереди и 1 позади. PR #9 и #10 остаются stacked на PR #8. PR #20 и #21 — Draft, GitHub сообщает `mergeable=true`.
- Workflow `.github/workflows/build.yml` запускает `npm install` и `npm run build`; он не выполняет SQL-, e2e- или браузерные проверки.
- Основная ветка, PR и production deployment в этом запуске не изменялись.

### Supabase — дополнительная проверка

- Проект `nmgyyrbqjfywxzweansj` подтверждён как `ACTIVE_HEALTHY`; регион `eu-west-1`, PostgreSQL 17.11.
- В проекте по-прежнему две прикладные таблицы: `public.user_progress` и `public.user_profiles`; RLS включён на обеих.
- Применены две миграции: `20261106191401_create_user_progress` и `20261107114146_create_user_profiles_and_seven_day_trial`.
- Пять RLS-политик для этих таблиц проверены через `pg_policies`; условия чтения/обновления и проверки вставки ограничивают строки значением `auth.uid() = user_id`.
- На `auth.users` действительно существует триггер `on_auth_user_created_alifly_profile`. Он вызывает `public.handle_new_alifly_user()`; функция помечена SECURITY DEFINER и имеет пустой search_path. Она создаёт профиль с `trial_started_at = auth.users.created_at` и `trial_ends_at = auth.users.created_at + interval '7 days'`.
- У `user_progress` в production всё ещё есть избыточные table-level права у `anon` и `authenticated`. PR #21 отзывает их у PUBLIC/anon/authenticated и затем выдаёт authenticated только SELECT/INSERT/UPDATE. Миграция не применялась к production.
- Уточнение по аудиту ACL: строки в `information_schema.column_privileges` могут отражать table-level grants, повторённые для каждого столбца; это не обязательно отдельные column-level GRANT. PostgreSQL подтверждает, что REVOKE привилегий на таблицу автоматически отзывает соответствующие привилегии столбцов. См. [PostgreSQL REVOKE](https://www.postgresql.org/docs/17/sql-revoke.html).
- Найдены default privileges для будущих таблиц в схеме `public`: для объектов, создаваемых ролями `postgres` и `supabase_admin`, по умолчанию заданы широкие права для `anon`, `authenticated` и `service_role`. Это не меняет текущие права `user_progress`, но означает, что будущие таблицы нужно отдельно защищать RLS и явными GRANT/REVOKE в их миграциях. Глобальные default privileges в рамках PR #21 не меняются, поскольку это затронуло бы все будущие таблицы в `public`.
- Список Supabase development branches пуст; платная ветка не создавалась.
- Security Advisor: одно предупреждение — Leaked Password Protection выключена. Performance и Health Advisors не вернули замечаний.

### Публичный сайт и ограничения проверки

- Прямой запрос к `https://iamaldamov.github.io/alifly/` не завершился: в текущей среде проверки возникла ошибка DNS. Веб-проверка также не смогла открыть URL. Это означает, что доступность не подтверждена из этой среды, но не доказывает, что сайт недоступен для пользователей.
- Успешный Pages deployment #14 подтверждает завершение workflow публикации, но не заменяет внешний HTTP-проверочный запрос.

### Следующий безопасный приоритет

1. Не объединять PR #7/#8 до согласования конфликтующих изменений с актуальным `main`; PR #9/#10 оставить stacked до интеграции базовой авторизации и профиля.
2. Перед применением PR #21 выполнить полную миграционную проверку в отдельной тестовой базе. Платную Supabase development branch без подтверждения стоимости не создавать.
3. Для каждой будущей таблицы в `public` явно включать RLS и задавать минимальные привилегии; глобальные default privileges пока не менять.
4. Включить Leaked Password Protection вручную в Supabase Dashboard и отдельно протестировать OAuth, SMS OTP и magic-link после настройки credentials.
5. Провести реальную проверку сайта и Service Worker на iPhone.
6. Не менять учебные арабские тексты, транскрипции и переводы без отдельной лингвистической проверки; не подключать платежи и не запускать списания.

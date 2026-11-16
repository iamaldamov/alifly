# ALIFLY — release readiness

Первичный снимок: 13 ноября 2026 года. Актуализация: 16 ноября 2026 года.

Этот документ фиксирует проверяемое состояние проекта перед интеграцией изменений и публикацией. Он не означает, что перечисленные функции уже доступны на production.

## Текущее состояние GitHub

- Репозиторий: https://github.com/iamaldamov/alifly
- Production URL: https://iamaldamov.github.io/alifly/
- Основная ветка: `main`
- Проверенный HEAD `main`: `a982c069cac23c8f8050016f1d97c5c97b2fcb6f` (Forest Glass visual system).
- Сборка текущего HEAD `main`: [GitHub Actions #195](https://github.com/iamaldamov/alifly/actions/runs/43367127408) — успешно.
- Публикация текущего HEAD `main`: [GitHub Pages deployment #14](https://github.com/iamaldamov/alifly/actions/runs/43367127516) — успешно.
- Последняя проверка PR: [Build ALIFLY #200](https://github.com/iamaldamov/alifly/actions/runs/43745279843) для PR #21 — успешно; [Build ALIFLY #198](https://github.com/iamaldamov/alifly/actions/runs/43477460845) для PR #20 — успешно.
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

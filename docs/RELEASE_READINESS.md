# ALIFLY — release readiness

Проверено: 13 ноября 2026 года.

Этот документ фиксирует проверяемое состояние проекта перед интеграцией изменений и публикацией. Он не означает, что перечисленные функции уже доступны на production.

## Текущее состояние GitHub

- Репозиторий: https://github.com/iamaldamov/alifly
- Production URL: https://iamaldamov.github.io/alifly/
- Основная ветка: `main`
- Проверенный HEAD `main`: `a982c069cac23c8f8050016f1d97c5c97b2fcb6f` (Forest Glass visual system).
- Последний проверенный PR build: [GitHub Actions run #190](https://github.com/iamaldamov/alifly/actions/runs/43274079163) — успешно; шаги установки зависимостей и TypeScript/Vite build завершились успешно для PR #18, commit `c24b645`.

### Открытые PR и порядок интеграции

Сравнение выполнено относительно `main` на момент проверки.

| PR | Назначение | Состояние ветки |
|---|---|---|
| [#7](https://github.com/iamaldamov/alifly/pull/7) | Welcome и представление автора | 2 коммита впереди, 7 позади; GitHub сообщает, что PR не готов к слиянию |
| [#8](https://github.com/iamaldamov/alifly/pull/8) | Бренд, регистрация, профиль, 7-дневный период | 21 впереди, 7 позади; GitHub сообщает, что PR не готов к слиянию |
| [#9](https://github.com/iamaldamov/alifly/pull/9) | Обработка auth callback | Ветка основана на PR #8, не является независимой от него |
| [#10](https://github.com/iamaldamov/alifly/pull/10) | Устойчивость синхронизации профиля | Ветка основана на PR #8, не является независимой от него |
| [#17](https://github.com/iamaldamov/alifly/pull/17) | Инструкция настройки auth providers | 1 коммит впереди и 1 позади |
| [#18](https://github.com/iamaldamov/alifly/pull/18) | Мобильная компоновка и мини-игра слов | 19 впереди, 1 позади; GitHub сообщает, что PR mergeable; остаётся черновиком |

Не объединять PR #9 и #10 напрямую в `main` до интеграции их базовой функциональности из PR #8. Перед интеграцией PR #7 и #8 необходимо согласовать изменения с актуальной `main`. PR #18 требует визуальной проверки на реальном iPhone; новый набор арабской лексики должен пройти отдельную языковую проверку.

## Supabase — проверенное состояние

- Проект `nmgyyrbqjfywxzweansj` отвечает со статусом `ACTIVE_HEALTHY`, регион `eu-west-1`.
- Миграции `20261106191401_create_user_progress` и `20261107114146_create_user_profiles_and_seven_day_trial` присутствуют в списке применённых миграций.
- Таблицы `public.user_progress` и `public.user_profiles` существуют; RLS включён на обеих.
- Политики чтения и изменения ограничивают строки значением `auth.uid() = user_id`.
- Для `authenticated` у `user_profiles` есть SELECT; обновлять можно только `display_name`, `age`, `gender`, `avatar_id`. Проверка привилегий подтвердила, что `trial_started_at` и `trial_ends_at` не доступны для UPDATE от роли `authenticated`.
- Триггер `on_auth_user_created_alifly_profile` вызывает `handle_new_alifly_user()`; функция создаёт профиль с началом периода из `auth.users.created_at` и окончанием через 7 дней.
- Security advisor сообщает предупреждение `auth_leaked_password_protection`: защита от скомпрометированных паролей отключена. Performance и health advisors не вернули замечаний.

## Требуется ручная проверка в Supabase Dashboard

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

- Проверить опубликованный сайт и фактический статус последнего GitHub Pages deployment. В этой проверке прямой сетевой запрос к GitHub Pages не завершился; это не является доказательством недоступности сайта.
- Получить подтверждение успешного Actions run для актуального HEAD `main`; run #190 относится к PR #18, а не к текущему `main`.
- Провести ручную проверку UI на iPhone и проверить обновление Service Worker/cache после публикации.
- Проверить auth providers после ручной настройки Dashboard.

## Следующий безопасный приоритет

Сначала согласовать интеграционный порядок PR #7 и #8 с актуальной `main`, затем перенести/проверить callback и profile-resilience изменения из PR #9 и #10. Не переписывать учебные материалы и прогресс; не менять арабские тексты без надёжной лингвистической проверки.

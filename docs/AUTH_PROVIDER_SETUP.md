# ALIFLY — настройка провайдеров авторизации

> Инструкция подготовлена для проекта `nmgyyrbqjfywxzweansj`. Это чек-лист ручной настройки, а не подтверждение того, что провайдеры уже включены.

## Важное условие перед настройкой

На 11 ноября 2026 года основная ветка `main` ещё не содержит весь новый экран регистрации и профиль из PR #8. PR #8 открыт и отстаёт от `main`; PR #9 и #10 основаны на ветке PR #8. Поэтому сначала нужно безопасно интегрировать и проверить код авторизации. Не включайте кнопки OAuth/SMS в production до этого шага.

- [PR #8 — onboarding, аккаунт и бренд](https://github.com/iamaldamov/alifly/pull/8)
- [PR #9 — обработка callback](https://github.com/iamaldamov/alifly/pull/9)
- [PR #10 — устойчивость профиля](https://github.com/iamaldamov/alifly/pull/10)

## Адреса ALIFLY

Проверьте эти значения в Supabase Dashboard перед сохранением:

- Production URL приложения: `https://iamaldamov.github.io/alifly/`
- Google Authorized JavaScript origin: `https://iamaldamov.github.io`
- Ожидаемый Supabase OAuth callback: `https://nmgyyrbqjfywxzweansj.supabase.co/auth/v1/callback`

Если страница конкретного провайдера в Supabase Dashboard показывает другой callback URL, используйте скопированное из Dashboard значение.

## 1. Общие URL-адреса Supabase

1. Откройте проект **alifly** в Supabase Dashboard.
2. Перейдите в **Authentication → URL Configuration**.
3. Установите **Site URL** на `https://iamaldamov.github.io/alifly/`.
4. Добавьте в **Redirect URLs** точный адрес `https://iamaldamov.github.io/alifly/`.
5. Для локальной разработки добавляйте отдельный localhost URL только при необходимости; не используйте широкие wildcard-шаблоны в production.
6. Сохраните настройки.

Приложение из PR #8 формирует redirect URL из origin и Vite base path, поэтому для GitHub Pages важен путь `/alifly/`, а не только домен.

## 2. Google OAuth

1. В Google Cloud Console создайте OAuth client типа **Web application**.
2. В **Authorized JavaScript origins** добавьте `https://iamaldamov.github.io` (без `/alifly/`).
3. В **Authorized redirect URIs** добавьте callback, скопированный со страницы Google provider в Supabase. Ожидаемый адрес: `https://nmgyyrbqjfywxzweansj.supabase.co/auth/v1/callback`.
4. В Google Auth Platform настройте экран согласия и минимальные базовые scopes: `openid`, email и profile.
5. В Supabase откройте **Authentication → Sign In / Providers → Google**, включите Google и внесите Client ID и Client Secret.
6. Секрет храните только в Supabase Dashboard/менеджере секретов. Не помещайте его в React-код, GitHub, issue или переписку.

Официальная инструкция: https://supabase.com/docs/guides/auth/social-sign-in/auth-google

## 3. Sign in with Apple

Для web OAuth нужен Apple Developer account и Service ID.

1. В Apple Developer создайте и настройте **Services ID** для ALIFLY.
2. Включите **Sign in with Apple** и укажите домен Supabase проекта: `nmgyyrbqjfywxzweansj.supabase.co`.
3. В Return URL укажите callback, скопированный из Apple provider в Supabase. Ожидаемый адрес: `https://nmgyyrbqjfywxzweansj.supabase.co/auth/v1/callback`.
4. Создайте Sign in with Apple key и подготовьте Team ID, Key ID и приватный ключ.
5. В Supabase откройте **Authentication → Sign In / Providers → Apple**, включите провайдер и внесите данные в соответствующие поля.
6. Не отправляйте файл приватного ключа в чат и не добавляйте его в репозиторий.

Официальная инструкция: https://supabase.com/docs/guides/auth/social-sign-in/auth-apple

## 4. Email magic-link

1. В Supabase проверьте, что Email provider включён и подтверждение адреса настроено согласно политике проекта.
2. Проверьте шаблон письма и ссылку подтверждения; не меняйте шаблон, пока не выполнен тестовый проход.
3. Убедитесь, что production URL присутствует в Redirect URLs.
4. Отправьте тестовую ссылку на адрес, которым можно безопасно управлять.
5. Откройте письмо в том же браузере и профиле устройства, где был начат запрос: PKCE использует локально сохранённый verifier.
6. Проверьте успешный возврат в ALIFLY, появление сессии после перезагрузки, а также понятное сообщение для просроченной или уже использованной ссылки.

Документация:
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/auth/sessions/pkce-flow
- https://supabase.com/docs/guides/auth/redirect-urls

## 5. Вход по телефону (SMS OTP)

1. Сначала выберите SMS-провайдера с учётом стоимости, доставки и поддержки стран, где будут находиться учащиеся. Провайдер здесь намеренно не выбран.
2. В Supabase откройте **Authentication → Sign In / Providers → Phone** и включайте телефонную авторизацию только после настройки доставки.
3. Внесите SMS credentials непосредственно в Supabase Dashboard.
4. Проверьте лимит повторной отправки, срок действия OTP и CAPTCHA/rate limits, чтобы ограничить злоупотребления и неожиданные расходы.
5. Для первичной проверки используйте тестовые номера Supabase, если они доступны для выбранной конфигурации. Перед production удалите тестовые OTP.
6. Проверьте получение кода, неверный/просроченный код, повторную отправку и успешный вход.

Поддерживаемые варианты и шаги настройки: https://supabase.com/docs/guides/auth/phone-login

## 6. Проверка безопасности

- Включите **Leaked Password Protection** в **Authentication → Password Security**, чтобы устранить текущее предупреждение Security Advisor.
- Не публикуйте service-role key. В браузере допускается только publishable/anon key с корректными RLS-политиками.
- Не ослабляйте RLS ради тестирования.
- Не проверяйте приватные данные одного пользователя через клиентскую сессию другого пользователя.

## 7. Приёмочная проверка перед включением в production

- [ ] Чистая TypeScript/Vite сборка после интеграции PR.
- [ ] Google OAuth возвращает пользователя в `/alifly/`.
- [ ] Apple OAuth возвращает пользователя в `/alifly/`.
- [ ] Magic-link работает в том же браузере, с понятной ошибкой для старой ссылки.
- [ ] SMS OTP доставляется и проверяется без повторных неожиданных отправок.
- [ ] После первой регистрации создаётся ровно один профиль.
- [ ] `trial_started_at` соответствует моменту создания аккаунта, а `trial_ends_at` — ровно через 7 суток.
- [ ] После выхода и повторного входа сессия и профиль восстанавливаются.
- [ ] RLS не позволяет читать или менять чужой профиль и прогресс.
- [ ] Все четыре сценария проверены на реальном iPhone.

Не включайте оплату и не создавайте платёжные списания в рамках проверки авторизации.

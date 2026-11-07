import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

type CloudStatus = "idle" | "loading" | "pending" | "saving" | "saved" | "error";
type Props = {
  cloudStatus: CloudStatus;
  authReady: boolean;
  authCallbackError: string | null;
  autoOpen: boolean;
  openRequest: number;
};

const getRedirectUrl = () => `${window.location.origin}${import.meta.env.BASE_URL}`;

export default function AuthPanel({ cloudStatus, authReady, authCallbackError, autoOpen, openRequest }: Props) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (autoOpen && authReady && !user) setIsOpen(true);
  }, [autoOpen, authReady, user?.id]);

  useEffect(() => {
    if (openRequest > 0) setIsOpen(true);
  }, [openRequest]);

  useEffect(() => {
    if (authCallbackError) {
      setError(authCallbackError);
      setIsOpen(true);
    }
  }, [authCallbackError]);

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const startOAuth = async (provider: "google" | "apple") => {
    clearFeedback();
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: getRedirectUrl() },
      });
      if (authError) throw authError;
    } catch (authError) {
      const details = authError instanceof Error ? authError.message : "";
      setError(provider === "google"
        ? "Вход через Google пока не подключён в Supabase. Проверь настройки Google OAuth." 
        : "Вход через Apple пока не подключён в Supabase. Проверь настройки Apple OAuth.");
      if (details) console.warn("ALIFLY OAuth error:", details);
      setBusy(false);
    }
  };

  const sendEmailLink = async () => {
    clearFeedback();
    if (!email.trim()) {
      setError("Введи адрес электронной почты.");
      return;
    }
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: getRedirectUrl(),
          shouldCreateUser: true,
        },
      });
      if (authError) throw authError;
      setMessage("Ссылка отправлена. Открой письмо на этом устройстве. Если ссылка уже использована или устарела, запроси новую.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Не удалось отправить письмо. Попробуй ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  const sendPhoneCode = async () => {
    clearFeedback();
    if (!phone.trim()) {
      setError("Введи номер телефона в международном формате, например +4915112345678.");
      return;
    }
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
        options: { shouldCreateUser: true },
      });
      if (authError) throw authError;
      setPhoneCodeSent(true);
      setMessage("Код отправлен по SMS. Введи его ниже.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Не удалось отправить SMS. Проверь номер и настройки SMS-провайдера.");
    } finally {
      setBusy(false);
    }
  };

  const verifyPhoneCode = async () => {
    clearFeedback();
    if (!code.trim()) {
      setError("Введи код из SMS.");
      return;
    }
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: code.trim(),
        type: "sms",
      });
      if (authError) throw authError;
      setMessage("Телефон подтверждён. Добро пожаловать в ALIFLY!");
      setIsOpen(false);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Код не подошёл. Запроси новый и попробуй ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    clearFeedback();
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;
      setIsOpen(false);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Не удалось выйти из аккаунта.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-control">
      <button className={user ? "account-button is-signed-in" : "account-button"} type="button" onClick={() => { clearFeedback(); setIsOpen(true); }}>
        <span aria-hidden="true">{user ? "●" : "↗"}</span>
        <span>{user ? "Мой аккаунт" : "Войти"}</span>
      </button>

      {isOpen && (
        <div className="auth-backdrop" onClick={() => setIsOpen(false)}>
          <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(event) => event.stopPropagation()}>
            <button className="auth-close" type="button" onClick={() => setIsOpen(false)} aria-label="Закрыть">×</button>
            {user ? (
              <>
                <span className="auth-kicker">ТВОЙ АККАУНТ</span>
                <h2 id="auth-title">Добро пожаловать!</h2>
                <p className="auth-description">Твой прогресс ALIFLY привязан к этому аккаунту и может синхронизироваться между устройствами.</p>
                <p className={cloudStatus === "error" ? "auth-error" : "auth-message"} role="status">
                  {cloudStatus === "loading" ? "Загружаем твой прогресс…" : cloudStatus === "pending" || cloudStatus === "saving" ? "Сохраняем прогресс…" : cloudStatus === "error" ? "Не удалось синхронизировать прогресс. Проверь интернет и обнови страницу." : cloudStatus === "saved" ? "Прогресс успешно синхронизирован." : "Аккаунт подключён."}
                </p>
                <p className="auth-user-email">{user.email || user.phone || "Аккаунт через социальную сеть"}</p>
                <button className="auth-submit" type="button" onClick={signOut} disabled={busy}>{busy ? "Подожди…" : "Выйти из аккаунта"}</button>
              </>
            ) : (
              <>
                <span className="auth-kicker">ТВОЙ ПУТЬ НАЧИНАЕТСЯ ЗДЕСЬ</span>
                <h2 id="auth-title">Создай аккаунт ALIFLY</h2>
                <p className="auth-description">Сохрани свой прогресс и получи 7 дней бесплатного доступа ко всем возможностям обучения.</p>

                <button className="auth-google" type="button" onClick={() => void startOAuth("google")} disabled={busy}>
                  <span className="google-g" aria-hidden="true">G</span> Продолжить с Google
                </button>
                <button className="auth-apple" type="button" onClick={() => void startOAuth("apple")} disabled={busy}>
                  <span aria-hidden="true">●</span> Продолжить с Apple
                </button>

                <div className="auth-divider"><span>или по электронной почте</span></div>
                <form className="auth-form" onSubmit={(event) => { event.preventDefault(); void sendEmailLink(); }}>
                  <label htmlFor="auth-email">Электронная почта</label>
                  <input id="auth-email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                  <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Отправляем…" : "Получить ссылку для входа"}</button>
                </form>

                <div className="auth-divider"><span>или по номеру телефона</span></div>
                <form className="auth-form" onSubmit={(event) => { event.preventDefault(); void (phoneCodeSent ? verifyPhoneCode() : sendPhoneCode()); }}>
                  <label htmlFor="auth-phone">Номер телефона</label>
                  <input id="auth-phone" type="tel" autoComplete="tel" placeholder="+4915112345678" value={phone} onChange={(event) => setPhone(event.target.value)} />
                  {phoneCodeSent && (
                    <>
                      <label htmlFor="auth-code">Код из SMS</label>
                      <input id="auth-code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={code} onChange={(event) => setCode(event.target.value)} />
                    </>
                  )}
                  <button className="auth-submit auth-submit-secondary" type="submit" disabled={busy}>{busy ? "Подожди…" : phoneCodeSent ? "Подтвердить код" : "Отправить SMS-код"}</button>
                </form>
                {message && <p className="auth-message" role="status">{message}</p>}
                {error && <p className="auth-error" role="alert">{error}</p>}
                <p className="auth-privacy">Продолжая, ты создаёшь аккаунт и соглашаешься использовать ALIFLY в соответствии с правилами сервиса.</p>
              </>
            )}
            {user && error && <p className="auth-error" role="alert">{error}</p>}
          </section>
        </div>
      )}
    </div>
  );
}

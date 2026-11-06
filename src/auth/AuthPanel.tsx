import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

type CloudStatus = "idle" | "loading" | "pending" | "saving" | "saved" | "error";

export default function AuthPanel({ cloudStatus }: { cloudStatus: CloudStatus }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const signInWithApple = async () => {
    clearFeedback();
    setBusy(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    });
    if (authError) {
      setError("Вход через Apple пока не настроен. Сначала подключи Apple в настройках Supabase.");
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
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
        shouldCreateUser: true,
      },
    });
    setBusy(false);
    if (authError) setError(authError.message);
    else setMessage("Ссылка для входа отправлена. Проверь почту и открой письмо на этом устройстве.");
  };

  const sendPhoneCode = async () => {
    clearFeedback();
    if (!phone.trim()) {
      setError("Введи номер телефона в международном формате, например +79990000000.");
      return;
    }
    setBusy(true);
    const { error: authError } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (authError) setError(authError.message);
    else {
      setPhoneCodeSent(true);
      setMessage("Код отправлен по SMS. Введи его ниже.");
    }
  };

  const verifyPhoneCode = async () => {
    clearFeedback();
    setBusy(true);
    const { error: authError } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: code.trim(),
      type: "sms",
    });
    setBusy(false);
    if (authError) setError(authError.message);
    else {
      setMessage("Телефон подтверждён. Прогресс будет сохранён в аккаунте.");
      setIsOpen(false);
    }
  };

  const signOut = async () => {
    clearFeedback();
    setBusy(true);
    const { error: authError } = await supabase.auth.signOut();
    setBusy(false);
    if (authError) setError(authError.message);
    else {
      setIsOpen(false);
      setMessage("");
    }
  };

  return (
    <div className="auth-control">
      <button className={user ? "account-button is-signed-in" : "account-button"} type="button" onClick={() => { clearFeedback(); setIsOpen(true); }}>
        <span aria-hidden="true">{user ? "✓" : "♙"}</span>
        <span>{user ? "Аккаунт" : "Сохранить прогресс"}</span>
      </button>

      {isOpen && (
        <div className="auth-backdrop" onClick={() => setIsOpen(false)}>
          <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(event) => event.stopPropagation()}>
            <button className="auth-close" type="button" onClick={() => setIsOpen(false)} aria-label="Закрыть">×</button>
            {user ? (
              <>
                <span className="auth-kicker">ТВОЙ АККАУНТ</span>
                <h2 id="auth-title">Аккаунт ALIFLY</h2>
                <p className="auth-description">Ты вошёл в ALIFLY. Твой прогресс привязан к этому аккаунту.</p>
                <p className={cloudStatus === "error" ? "auth-error" : "auth-message"} role="status">{cloudStatus === "loading" ? "Загружаем твой прогресс…" : cloudStatus === "pending" || cloudStatus === "saving" ? "Сохраняем прогресс…" : cloudStatus === "error" ? "Не удалось синхронизировать прогресс. Проверь интернет и обнови страницу." : cloudStatus === "saved" ? "Прогресс успешно синхронизирован." : "Подключаем аккаунт…"}</p>
                <p className="auth-user-email">{user.email || user.phone || "Аккаунт Apple"}</p>
                <button className="auth-submit" type="button" onClick={signOut} disabled={busy}>{busy ? "Подожди…" : "Выйти из аккаунта"}</button>
              </>
            ) : (
              <>
                <span className="auth-kicker">ALIFLY · ТВОИ ЗНАНИЯ</span>
                <h2 id="auth-title">Сохрани свой прогресс</h2>
                <p className="auth-description">Войди, чтобы продолжить обучение с любого устройства — даже если сменишь iPhone.</p>

                <button className="auth-apple" type="button" onClick={signInWithApple} disabled={busy}>
                  <span aria-hidden="true">●</span> Продолжить с Apple
                </button>

                <div className="auth-divider"><span>или по почте</span></div>
                <form className="auth-form" onSubmit={(event) => { event.preventDefault(); void sendEmailLink(); }}>
                  <label htmlFor="auth-email">Электронная почта</label>
                  <input id="auth-email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                  <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Отправляем…" : "Получить ссылку для входа"}</button>
                </form>

                <div className="auth-divider"><span>или по номеру телефона</span></div>
                <form className="auth-form" onSubmit={(event) => { event.preventDefault(); void (phoneCodeSent ? verifyPhoneCode() : sendPhoneCode()); }}>
                  <label htmlFor="auth-phone">Номер телефона</label>
                  <input id="auth-phone" type="tel" autoComplete="tel" placeholder="+79990000000" value={phone} onChange={(event) => setPhone(event.target.value)} />
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
                <p className="auth-privacy">Твой прогресс доступен только после входа в твой аккаунт.</p>
              </>
            )}
            {user && error && <p className="auth-error" role="alert">{error}</p>}
          </section>
        </div>
      )}
    </div>
  );
}

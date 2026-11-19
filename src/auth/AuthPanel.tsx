import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

type CloudStatus = "idle" | "loading" | "pending" | "saving" | "saved" | "error";
type AuthMode = "signup" | "signin";

export default function AuthPanel({ cloudStatus }: { cloudStatus: CloudStatus }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const redirectUrl = window.location.origin + import.meta.env.BASE_URL;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
        setIsOpen(true);
        setMessage("Придумай новый пароль для своего аккаунта.");
        setError("");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const submitEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();
    if (password.length < 8) {
      setError("Пароль должен содержать не менее 8 символов.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (authError) throw authError;
        if (data.session) {
          setIsOpen(false);
          setMessage("");
        } else {
          setMessage("Аккаунт создан. Проверь почту и подтверди адрес, затем войди в ALIFLY.");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (authError) throw authError;
        setIsOpen(false);
        setMessage("");
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Не удалось выполнить вход. Попробуй ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  const sendPasswordReset = async () => {
    clearFeedback();
    if (!email.trim()) {
      setError("Сначала введи адрес электронной почты.");
      return;
    }
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: redirectUrl,
      });
      if (authError) throw authError;
      setMessage("Ссылка для смены пароля отправлена на почту.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Не удалось отправить ссылку.");
    } finally {
      setBusy(false);
    }
  };

  const updatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();
    if (newPassword.length < 8) {
      setError("Новый пароль должен содержать не менее 8 символов.");
      return;
    }
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
      if (authError) throw authError;
      setIsRecovery(false);
      setNewPassword("");
      setIsOpen(false);
      setMessage("");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Не удалось изменить пароль.");
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
        <span aria-hidden="true">{user ? "✓" : "♙"}</span>
        <span>{user ? "Аккаунт" : "Сохранить прогресс"}</span>
      </button>

      {isOpen && (
        <div className="auth-backdrop" onClick={() => setIsOpen(false)}>
          <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(event) => event.stopPropagation()}>
            <button className="auth-close" type="button" onClick={() => setIsOpen(false)} aria-label="Закрыть">×</button>
            {user && !isRecovery ? (
              <>
                <span className="auth-kicker">ТВОЙ АККАУНТ</span>
                <h2 id="auth-title">Аккаунт ALIFLY</h2>
                <p className="auth-description">Твой прогресс привязан к аккаунту и будет доступен после следующего входа.</p>
                <p className={cloudStatus === "error" ? "auth-error" : "auth-message"} role="status">
                  {cloudStatus === "loading" ? "Загружаем твой прогресс…" : cloudStatus === "pending" || cloudStatus === "saving" ? "Сохраняем прогресс…" : cloudStatus === "error" ? "Не удалось синхронизировать прогресс. Не закрывай страницу, пока соединение не восстановится." : cloudStatus === "saved" ? "Прогресс успешно сохранён в аккаунте." : "Подключаем аккаунт…"}
                </p>
                <p className="auth-user-email">{user.email || user.phone || "Аккаунт Apple"}</p>
                <button className="auth-submit" type="button" onClick={signOut} disabled={busy}>{busy ? "Подожди…" : "Выйти из аккаунта"}</button>
              </>
            ) : isRecovery ? (
              <>
                <span className="auth-kicker">ВОССТАНОВЛЕНИЕ ДОСТУПА</span>
                <h2 id="auth-title">Новый пароль</h2>
                <p className="auth-description">Задай новый пароль, чтобы снова войти в свой аккаунт.</p>
                <form className="auth-form" onSubmit={updatePassword}>
                  <label htmlFor="auth-new-password">Новый пароль</label>
                  <input id="auth-new-password" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
                  <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Сохраняем…" : "Сохранить новый пароль"}</button>
                </form>
              </>
            ) : (
              <>
                <span className="auth-kicker">ALIFLY · ТВОИ ЗНАНИЯ</span>
                <h2 id="auth-title">{mode === "signup" ? "Создай аккаунт" : "С возвращением"}</h2>
                <p className="auth-description">Сохраняй пройденные уроки и продолжай обучение с любого устройства.</p>
                <div className="auth-mode-switch" role="group" aria-label="Выбор действия">
                  <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); clearFeedback(); }}>Регистрация</button>
                  <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); clearFeedback(); }}>Войти</button>
                </div>
                <form className="auth-form" onSubmit={submitEmailAuth}>
                  <label htmlFor="auth-email">Электронная почта</label>
                  <input id="auth-email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                  <label htmlFor="auth-password">Пароль</label>
                  <input id="auth-password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} placeholder="Не менее 8 символов" value={password} onChange={(event) => setPassword(event.target.value)} required />
                  <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Подожди…" : mode === "signup" ? "Создать аккаунт" : "Войти в ALIFLY"}</button>
                </form>
                {mode === "signin" && <button className="auth-apple auth-reset-button" type="button" onClick={sendPasswordReset} disabled={busy}>Забыли пароль? Отправить ссылку</button>}
                <p className="auth-privacy">Пароль хранится в Supabase Auth. ALIFLY не видит и не сохраняет его в открытом виде.</p>
              </>
            )}
            {message && <p className="auth-message" role="status">{message}</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}
          </section>
        </div>
      )}
    </div>
  );
}

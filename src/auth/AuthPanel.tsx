import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut as firebaseSignOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "./AuthContext";

type CloudStatus = "idle" | "loading" | "pending" | "saving" | "saved" | "error";
type AuthMode = "signup" | "signin";
const AUTH_PROMPT_KEY = "alifly-auth-prompt-dismissed";
const TELEGRAM_SUPPORT_URL = "https://t.me/tribute/app?startapp=g6Qg";

function PersonIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.8 20c.55-3.45 3.35-5.4 7.2-5.4s6.65 1.95 7.2 5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function AuthPanel({ cloudStatus, onChangeLevel }: { cloudStatus: CloudStatus; onChangeLevel?: () => void }) {
  const { user, isLoading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      setIsOpen(false);
      return;
    }

    try {
      if (localStorage.getItem(AUTH_PROMPT_KEY) !== "1") setIsOpen(true);
    } catch {
      setIsOpen(true);
    }
  }, [authLoading, user?.uid]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) closePanel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, busy, user?.uid]);

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const markPromptDismissed = () => {
    try { localStorage.setItem(AUTH_PROMPT_KEY, "1"); } catch { /* optional */ }
  };

  function closePanel() {
    setIsOpen(false);
    if (!user) markPromptDismissed();
  }

  const openPanel = () => {
    clearFeedback();
    setMode(user ? "signin" : "signup");
    setIsOpen(true);
  };

  const submitEmailAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();
    if (password.length < 8) {
      setError("Пароль должен содержать не менее 8 символов.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
        await setDoc(doc(db, "users", credential.user.uid), {
          email: credential.user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        markPromptDismissed();
        setIsOpen(false);
        setMessage("");
      } else {
        await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
        markPromptDismissed();
        setIsOpen(false);
        setMessage("");
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Не удалось выполнить вход. Проверь почту и пароль.");
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
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setMessage("Ссылка для смены пароля отправлена на почту.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Не удалось отправить ссылку.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    clearFeedback();
    setBusy(true);
    try {
      await firebaseSignOut(auth);
      markPromptDismissed();
      setIsOpen(false);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Не удалось выйти из аккаунта.");
    } finally {
      setBusy(false);
    }
  };

  const modal = isOpen ? (
    <div className="auth-backdrop" onClick={closePanel}>
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={(event) => event.stopPropagation()}>
        <button className="auth-close" type="button" onClick={closePanel} aria-label="Закрыть">×</button>

        {user ? (
          <>
            <span className="auth-kicker">ТВОЙ АККАУНТ</span>
            <h2 id="auth-title">Аккаунт ALIFLY</h2>
            <p className="auth-description">Твой прогресс и уроки привязаны к аккаунту.</p>
            
            <p className={cloudStatus === "error" ? "auth-error" : "auth-message"} role="status">
              {cloudStatus === "loading" ? "Загружаем твой прогресс…" : cloudStatus === "pending" || cloudStatus === "saving" ? "Сохраняем прогресс…" : cloudStatus === "error" ? "Не удалось синхронизировать прогресс. Проверь интернет." : cloudStatus === "saved" ? "Прогресс успешно сохранён в аккаунте." : "Аккаунт подключён."}
            </p>
            <p className="auth-user-email">{user.email || user.phoneNumber || "Аккаунт ALIFLY"}</p>
            {onChangeLevel && (
              <button
                className="auth-reset-button"
                type="button"
                onClick={() => { closePanel(); onChangeLevel(); }}
                disabled={busy}
              >
                Изменить уровень обучения
              </button>
            )}
            <button className="auth-submit" type="button" onClick={signOut} disabled={busy}>{busy ? "Подожди…" : "Выйти из аккаунта"}</button>
          </>
        ) : (
          <>
            <span className="auth-kicker">ALIFLY · ТВОИ ЗНАНИЯ</span>
            <h2 id="auth-title">{mode === "signup" ? "Начни свой путь в ALIFLY" : "С возвращением"}</h2>
            <p className="auth-description">Создай аккаунт, чтобы сохранять уроки и продолжать обучение с любого устройства.</p>

            

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
            {mode === "signin" && <button className="auth-reset-button" type="button" onClick={sendPasswordReset} disabled={busy}>Забыли пароль? Отправить ссылку</button>}
            <p className="auth-privacy">Пароль безопасно хранится в Firebase Authentication. ALIFLY не видит и не сохраняет его в открытом виде.</p>
          </>
        )}

        {message && <p className="auth-message" role="status">{message}</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}

        {!user && (
          <a className="auth-support-button" href={TELEGRAM_SUPPORT_URL} target="_blank" rel="noreferrer" aria-label="Поддержать проект ALIFLY в Telegram">
            Поддержать проект <span aria-hidden="true">↗</span>
          </a>
        )}
      </section>
    </div>
  ) : null;

  return (
    <div className="auth-control">
      <button className="profile-avatar-button" type="button" onClick={openPanel} aria-label={user ? "Открыть аккаунт" : "Открыть регистрацию"} aria-haspopup="dialog" title="Профиль">
        <PersonIcon className="profile-person-icon" />
      </button>
      {modal && createPortal(modal, document.body)}
    </div>
  );
}

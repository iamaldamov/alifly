import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

type CloudStatus = "idle" | "loading" | "pending" | "saving" | "saved" | "error";
type AuthMode = "signup" | "signin";
type AvatarId = "duck" | "owl" | "turtle" | "fox" | "cat" | "panda";

const AVATARS: { id: AvatarId; emoji: string; name: string }[] = [
  { id: "duck", emoji: "🐤", name: "Утёнок" },
  { id: "owl", emoji: "🦉", name: "Сова" },
  { id: "turtle", emoji: "🐢", name: "Черепаха" },
  { id: "fox", emoji: "🦊", name: "Лисёнок" },
  { id: "cat", emoji: "🐱", name: "Котёнок" },
  { id: "panda", emoji: "🐼", name: "Панда" },
];

const AUTH_PROMPT_KEY = "alifly-auth-prompt-dismissed";
const AVATAR_STORAGE_KEY = "alifly-avatar-id";
const TELEGRAM_SUPPORT_URL = "https://t.me/share/url?url=https%3A%2F%2Fiamaldamov.github.io%2Falifly%2F&text=%D0%9F%D0%BE%D0%B4%D0%B4%D0%B5%D1%80%D0%B6%D0%B8%D1%82%D0%B5%20ALIFLY%20%E2%80%94%20%D0%BF%D0%BE%D0%B4%D0%B5%D0%BB%D0%B8%D1%82%D0%B5%D1%81%D1%8C%20%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%BE%D0%BC%20%D1%81%20%D1%82%D0%B5%D0%BC%D0%B8%2C%20%D0%BA%D1%82%D0%BE%20%D1%85%D0%BE%D1%87%D0%B5%D1%82%20%D0%B8%D0%B7%D1%83%D1%87%D0%B0%D1%82%D1%8C%20%D0%B0%D1%80%D0%B0%D0%B1%D1%81%D0%BA%D0%B8%D0%B9.";

function isAvatarId(value: unknown): value is AvatarId {
  return AVATARS.some((avatar) => avatar.id === value);
}

function readStoredAvatar(): AvatarId {
  try {
    const saved = localStorage.getItem(AVATAR_STORAGE_KEY);
    return isAvatarId(saved) ? saved : "duck";
  } catch {
    return "duck";
  }
}

function hasStoredAvatar(): boolean {
  try {
    return localStorage.getItem(AVATAR_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export default function AuthPanel({ cloudStatus }: { cloudStatus: CloudStatus }) {
  const { user, isLoading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [avatarId, setAvatarId] = useState<AvatarId>(readStoredAvatar);

  const redirectUrl = window.location.origin + import.meta.env.BASE_URL;
  const avatar = AVATARS.find((item) => item.id === avatarId) ?? AVATARS[0];

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
  }, [authLoading, user?.id]);

  useEffect(() => {
    if (!user) return;

    let active = true;
    const loadProfile = async () => {
      const { data, error: readError } = await supabase
        .from("user_profiles")
        .select("avatar_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;
      if (readError) {
        setProfileMessage("Не удалось загрузить персонажа из аккаунта.");
        return;
      }

      const localAvatar = readStoredAvatar();
      if (data && isAvatarId(data.avatar_id)) {
        if (data.avatar_id === "duck" && hasStoredAvatar() && localAvatar !== "duck") {
          const { error: updateError } = await supabase
            .from("user_profiles")
            .update({ avatar_id: localAvatar, updated_at: new Date().toISOString() })
            .eq("user_id", user.id);
          if (!active) return;
          if (!updateError) {
            setAvatarId(localAvatar);
            setProfileMessage("Выбранный персонаж сохранён в аккаунте.");
            return;
          }
        }

        setAvatarId(data.avatar_id);
        try { localStorage.setItem(AVATAR_STORAGE_KEY, data.avatar_id); } catch { /* local storage is optional */ }
      } else if (!data && hasStoredAvatar()) {
        setAvatarId(localAvatar);
      }
    };

    void loadProfile();
    return () => { active = false; };
  }, [user?.id]);

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
  }, [isOpen, busy, user?.id]);

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
    setProfileMessage("");
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

  const chooseAvatar = async (nextAvatar: AvatarId) => {
    setAvatarId(nextAvatar);
    setProfileMessage("");
    try { localStorage.setItem(AVATAR_STORAGE_KEY, nextAvatar); } catch { /* optional */ }

    if (!user) return;

    setBusy(true);
    try {
      const { data, error: updateError } = await supabase
        .from("user_profiles")
        .update({ avatar_id: nextAvatar, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .select("user_id")
        .maybeSingle();

      if (updateError) throw updateError;
      if (!data) throw new Error("Профиль не найден. Перезагрузи страницу и попробуй ещё раз.");
      setProfileMessage("Персонаж сохранён в твоём аккаунте.");
    } catch (profileError) {
      setProfileMessage(profileError instanceof Error ? profileError.message : "Не удалось сохранить персонажа.");
    } finally {
      setBusy(false);
    }
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
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (authError) throw authError;

        if (data.session) {
          markPromptDismissed();
          setIsOpen(false);
          setMessage("");
        } else {
          setMessage("Аккаунт создан. Проверь почту и подтверди адрес, чтобы войти в ALIFLY.");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (authError) throw authError;
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

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
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
      markPromptDismissed();
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

        {user && !isRecovery ? (
          <>
            <span className="auth-kicker">ТВОЙ АККАУНТ</span>
            <h2 id="auth-title">Аккаунт ALIFLY</h2>
            <p className="auth-description">Твой прогресс и выбранный персонаж привязаны к аккаунту.</p>
            <div className="avatar-picker">
              <span className="avatar-picker-title">ТВОЙ ПЕРСОНАЖ</span>
              <div className="avatar-options" role="group" aria-label="Выбери персонажа">
                {AVATARS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={avatarId === item.id ? "avatar-choice is-selected" : "avatar-choice"}
                    onClick={() => void chooseAvatar(item.id)}
                    disabled={busy}
                    aria-label={item.name}
                    aria-pressed={avatarId === item.id}
                  >
                    <span className="avatar-choice-emoji" aria-hidden="true">{item.emoji}</span>
                    <span className="avatar-choice-name">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
            {profileMessage && <p className="auth-message" role="status">{profileMessage}</p>}
            <p className={cloudStatus === "error" ? "auth-error" : "auth-message"} role="status">
              {cloudStatus === "loading" ? "Загружаем твой прогресс…" : cloudStatus === "pending" || cloudStatus === "saving" ? "Сохраняем прогресс…" : cloudStatus === "error" ? "Не удалось синхронизировать прогресс. Проверь интернет." : cloudStatus === "saved" ? "Прогресс успешно сохранён в аккаунте." : "Аккаунт подключён."}
            </p>
            <p className="auth-user-email">{user.email || user.phone || "Аккаунт ALIFLY"}</p>
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
            <h2 id="auth-title">{mode === "signup" ? "Начни свой путь в ALIFLY" : "С возвращением"}</h2>
            <p className="auth-description">Создай аккаунт, чтобы сохранять уроки и продолжать обучение с любого устройства.</p>

            <div className="avatar-picker">
              <span className="avatar-picker-title">СНАЧАЛА ВЫБЕРИ ПЕРСОНАЖА</span>
              <div className="avatar-options" role="group" aria-label="Выбери персонажа">
                {AVATARS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={avatarId === item.id ? "avatar-choice is-selected" : "avatar-choice"}
                    onClick={() => void chooseAvatar(item.id)}
                    disabled={busy}
                    aria-label={item.name}
                    aria-pressed={avatarId === item.id}
                  >
                    <span className="avatar-choice-emoji" aria-hidden="true">{item.emoji}</span>
                    <span className="avatar-choice-name">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

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
            <p className="auth-privacy">Пароль хранится в Supabase Auth. ALIFLY не видит и не сохраняет его в открытом виде.</p>
          </>
        )}

        {message && <p className="auth-message" role="status">{message}</p>}
        {error && <p className="auth-error" role="alert">{error}</p>}

        {!user && !isRecovery && (
          <a className="auth-support-button" href={TELEGRAM_SUPPORT_URL} target="_blank" rel="noreferrer" aria-label="Поддержать проект ALIFLY в Telegram">
            Поддержать проект <span aria-hidden="true">↗</span>
          </a>
        )}
      </section>
    </div>
  ) : null;

  return (
    <div className="auth-control">
      <button className="profile-avatar-button" type="button" onClick={openPanel} aria-label={user ? "Аккаунт и выбор персонажа" : "Регистрация и выбор персонажа"} aria-haspopup="dialog" title="Мой персонаж">
        <span aria-hidden="true">{avatar.emoji}</span>
      </button>
      {modal && createPortal(modal, document.body)}
    </div>
  );
}

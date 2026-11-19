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

function CharacterArt({ avatarId, className }: { avatarId: AvatarId; className: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {avatarId === "duck" && <>
        <circle cx="29" cy="33" r="21" fill="#F3D36D" stroke="#D7AC46" strokeWidth="1.5"/>
        <path d="M44 31q13-5 16 2-7 8-17 4" fill="#E98A43" stroke="#C66B2E" strokeWidth="1.3"/>
        <circle cx="22" cy="31" r="2.2" fill="#28372E"/><circle cx="36" cy="31" r="2.2" fill="#28372E"/>
        <path d="M26 40q5 4 9 0" fill="none" stroke="#B77A35" strokeWidth="1.6" strokeLinecap="round"/>
        <ellipse cx="16" cy="38" rx="3" ry="2" fill="#E99B88"/><ellipse cx="41" cy="38" rx="3" ry="2" fill="#E99B88"/>
      </>}
      {avatarId === "owl" && <>
        <path d="M13 25 10 8 25 18 39 18 54 8 51 27" fill="#8C674F" stroke="#664B3D" strokeWidth="1.5"/>
        <ellipse cx="32" cy="36" rx="23" ry="22" fill="#9C765B" stroke="#684C3A" strokeWidth="1.5"/>
        <ellipse cx="23" cy="34" rx="10" ry="12" fill="#F6E8CE"/><ellipse cx="41" cy="34" rx="10" ry="12" fill="#F6E8CE"/>
        <circle cx="24" cy="34" r="4" fill="#34423A"/><circle cx="40" cy="34" r="4" fill="#34423A"/>
        <path d="m32 39-4 6h8z" fill="#E9A84D"/>
      </>}
      {avatarId === "turtle" && <>
        <ellipse cx="29" cy="39" rx="21" ry="17" fill="#4F8B63" stroke="#2F6849" strokeWidth="1.5"/>
        <path d="m15 35 8-10 14-1 8 11-6 14-17 1z" fill="#75A975" stroke="#2F6849" strokeWidth="1.2"/>
        <path d="m23 25 7 13 7-14M22 50l8-12 9 11" fill="none" stroke="#3E7753" strokeWidth="1.3"/>
        <circle cx="48" cy="28" r="11" fill="#82B978" stroke="#4B8858" strokeWidth="1.5"/>
        <circle cx="51" cy="26" r="1.8" fill="#263C30"/><path d="M52 33q3 2 5-1" fill="none" stroke="#47764E" strokeWidth="1.3" strokeLinecap="round"/>
        <ellipse cx="13" cy="51" rx="6" ry="4" fill="#82B978"/><ellipse cx="40" cy="54" rx="6" ry="4" fill="#82B978"/>
      </>}
      {avatarId === "fox" && <>
        <path d="M14 28 12 7 29 18 36 18 52 7 50 29" fill="#D9783E" stroke="#A94E2E" strokeWidth="1.5"/>
        <path d="m18 22-1-9 10 8M45 21l3-8-10 8" fill="#F6D9B9"/>
        <circle cx="32" cy="35" r="21" fill="#DC8547" stroke="#A94E2E" strokeWidth="1.5"/>
        <ellipse cx="32" cy="43" rx="13" ry="9" fill="#F9EBD7"/>
        <circle cx="24" cy="34" r="2" fill="#28372E"/><circle cx="40" cy="34" r="2" fill="#28372E"/>
        <path d="m29 41 3-2 3 2-3 3z" fill="#49352D"/><path d="M27 47q5 4 10 0" fill="none" stroke="#936046" strokeWidth="1.4"/>
      </>}
      {avatarId === "cat" && <>
        <path d="M12 27 14 8 29 19 36 19 51 8 53 29" fill="#A9B5A7" stroke="#6F7C72" strokeWidth="1.5"/>
        <path d="m19 21 1-8 7 7M44 20l-1-7-7 7" fill="#EAC9B4"/>
        <circle cx="32" cy="36" r="21" fill="#C8D0C3" stroke="#798678" strokeWidth="1.5"/>
        <ellipse cx="24" cy="35" rx="2" ry="3" fill="#26382D"/><ellipse cx="40" cy="35" rx="2" ry="3" fill="#26382D"/>
        <path d="m29 41 3-2 3 2-3 3z" fill="#B77E79"/>
        <path d="M32 44q-4 5-8 1M32 44q4 5 8 1M22 42 8 39M42 42l14-3" fill="none" stroke="#647468" strokeWidth="1.3" strokeLinecap="round"/>
      </>}
      {avatarId === "panda" && <>
        <circle cx="17" cy="18" r="10" fill="#303C35"/><circle cx="47" cy="18" r="10" fill="#303C35"/>
        <circle cx="32" cy="35" r="23" fill="#F1F0E7" stroke="#A9B3A7" strokeWidth="1.5"/>
        <ellipse cx="23" cy="34" rx="7" ry="9" transform="rotate(25 23 34)" fill="#303C35"/>
        <ellipse cx="41" cy="34" rx="7" ry="9" transform="rotate(-25 41 34)" fill="#303C35"/>
        <circle cx="24" cy="34" r="2.2" fill="#fff"/><circle cx="40" cy="34" r="2.2" fill="#fff"/>
        <ellipse cx="32" cy="43" rx="6" ry="4.5" fill="#303C35"/>
      </>}
    </svg>
  );
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

        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          setMode("signin");
          setMessage("У тебя уже есть аккаунт! Эта почта уже зарегистрирована. Войди в свой аккаунт или нажми «Забыли пароль?», если не помнишь пароль.");
        } else if (data.session) {
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
                    <CharacterArt avatarId={item.id} className="avatar-choice-art" />
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
                    <CharacterArt avatarId={item.id} className="avatar-choice-art" />
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
        <CharacterArt avatarId={avatar.id} className="profile-avatar-art" />
      </button>
      {modal && createPortal(modal, document.body)}
    </div>
  );
}
